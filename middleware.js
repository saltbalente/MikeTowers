// middleware.ts
import { NextResponse, NextRequest } from ‘next/server’;
import dns from ‘dns/promises’;

const PROXYCHECK_API_KEY = process.env.PROXYCHECK_API_KEY || ‘7w48yx-406284-067674-wi3016’;

// Cache en memoria para reducir llamadas DNS y API
const cache = new Map<string, { result: boolean; timestamp: number; type: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getClientIP(request: NextRequest): string | null {
// En Vercel, el orden de prioridad es importante
const forwardedFor = request.headers.get(‘x-forwarded-for’);
const realIP = request.headers.get(‘x-real-ip’);
const cfConnectingIP = request.headers.get(‘cf-connecting-ip’); // Si usas Cloudflare

// x-forwarded-for puede tener múltiples IPs separadas por coma
if (forwardedFor) {
const firstIP = forwardedFor.split(’,’)[0].trim();
if (isValidIP(firstIP)) return firstIP;
}

if (realIP && isValidIP(realIP)) return realIP;
if (cfConnectingIP && isValidIP(cfConnectingIP)) return cfConnectingIP;

// Como último recurso, usar la IP de Vercel
const ip = request.ip;
if (ip && isValidIP(ip)) return ip;

return null;
}

function isValidIP(ip: string): boolean {
// Validar formato IPv4 e IPv6 básico
const ipv4Regex = /^(\d{1,3}.){3}\d{1,3}$/;
const ipv6Regex = /^[0-9a-fA-F:]+$/;

if (ipv4Regex.test(ip)) {
// Verificar que cada octeto esté entre 0-255
return ip.split(’.’).every(octet => {
const num = parseInt(octet);
return num >= 0 && num <= 255;
});
}

return ipv6Regex.test(ip) && ip.length <= 39;
}

function isLocalIP(ip: string): boolean {
// IPs privadas y locales que debemos permitir
const localRanges = [
/^127./,          // localhost
/^192.168./,     // Redes privadas
/^10./,           // Redes privadas
/^172.(1[6-9]|2\d|3[01])./,  // Redes privadas
/^::1$/,           // IPv6 localhost
/^fe80:/,          // IPv6 link-local
];

return localRanges.some(range => range.test(ip));
}

function getCachedResult(key: string): { result: boolean; type: string } | null {
const cached = cache.get(key);
if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
return { result: cached.result, type: cached.type };
}

// Limpiar cache expirado
if (cached) cache.delete(key);
return null;
}

function setCacheResult(key: string, result: boolean, type: string): void {
cache.set(key, {
result,
type,
timestamp: Date.now()
});

// Limpiar cache si crece mucho (prevenir memory leaks)
if (cache.size > 1000) {
const now = Date.now();
for (const [k, v] of cache.entries()) {
if (now - v.timestamp > CACHE_DURATION) {
cache.delete(k);
}
}
}
}

async function isGoogleBot(ip: string): Promise<boolean> {
try {
// Verificar cache primero
const cached = getCachedResult(`googlebot_${ip}`);
if (cached !== null) {
return cached.result;
}

```
const reverse = await dns.reverse(ip);
const hostname = reverse[0];

if (hostname && (hostname.endsWith('.googlebot.com') || hostname.endsWith('.google.com'))) {
  const forward = await dns.resolve(hostname);
  const isValidBot = forward.includes(ip);
  
  // Cachear resultado
  setCacheResult(`googlebot_${ip}`, isValidBot, 'googlebot');
  
  return isValidBot;
}
```

} catch (error) {
console.error(`Error de DNS al verificar Googlebot para IP: ${ip}`, error);
}

// Cachear resultado negativo
setCacheResult(`googlebot_${ip}`, false, ‘unknown’);
return false;
}

async function checkVPN(ip: string): Promise<{ isVPN: boolean; details?: any }> {
try {
// Verificar cache primero
const cached = getCachedResult(`vpn_${ip}`);
if (cached !== null) {
return { isVPN: cached.result, details: { cached: true, type: cached.type } };
}

```
const proxyCheckUrl = `https://proxycheck.io/v2/${ip}?key=${PROXYCHECK_API_KEY}&vpn=1&asn=1&risk=1&port=1&seen=1&days=7&tag=vercel-protection`;

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

const response = await fetch(proxyCheckUrl, { 
  cache: 'no-store',
  signal: controller.signal,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)'
  }
});

clearTimeout(timeoutId);

if (!response.ok) {
  throw new Error(`Error en ProxyCheck: ${response.status} ${response.statusText}`);
}

const data = await response.json();
const result = data[ip];

if (result) {
  const isVPN = (
    result.proxy === 'yes' || 
    result.vpn === 'yes' || 
    result.type === 'VPN' ||
    (result.risk && result.risk > 75) // Alto riesgo también se considera VPN
  );
  
  // Cachear resultado
  setCacheResult(`vpn_${ip}`, isVPN, result.type || 'proxy');
  
  return { 
    isVPN, 
    details: {
      proxy: result.proxy,
      vpn: result.vpn,
      type: result.type,
      risk: result.risk,
      country: result.country,
      provider: result.provider
    }
  };
}

// Sin datos, asumir limpio
setCacheResult(`vpn_${ip}`, false, 'clean');
return { isVPN: false };
```

} catch (error) {
console.error(`Error al verificar VPN para IP ${ip}:`, error);

```
// En caso de error, no bloquear pero loguear
if (error.name === 'AbortError') {
  console.error('Timeout en verificación de VPN');
}

return { isVPN: false, details: { error: error.message } };
```

}
}

export async function middleware(request: NextRequest) {
const startTime = Date.now();

// Obtener IP del cliente
const ip = getClientIP(request);

// Si no se puede obtener la IP, bloquear por seguridad
if (!ip) {
console.warn(“No se pudo obtener la IP del usuario. Acceso denegado por seguridad.”);
return new NextResponse(‘Error: No se pudo verificar la dirección IP’, {
status: 400,
headers: {
‘X-Blocked-Reason’: ‘IP-Not-Detected’
}
});
}

// Permitir IPs locales en desarrollo
if (isLocalIP(ip)) {
console.log(`Permitido: IP local/privada detectada: ${ip}`);
return NextResponse.next();
}

try {
// Verificar si es Googlebot primero (más rápido)
const isBot = await isGoogleBot(ip);
if (isBot) {
console.log(`✅ Permitido: Googlebot verificado para IP: ${ip} (${Date.now() - startTime}ms)`);
return NextResponse.next();
}

```
// Verificar VPN/Proxy
const vpnCheck = await checkVPN(ip);

if (vpnCheck.isVPN) {
  const details = vpnCheck.details;
  console.log(`🚫 Acceso denegado para IP: ${ip}. Detalles:`, details);
  
  return new NextResponse('Acceso denegado: Se ha detectado el uso de un VPN o proxy.', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain',
      'X-Blocked-Reason': 'VPN-Proxy-Detected',
      'X-Blocked-Type': details?.type || 'unknown',
      'X-Response-Time': `${Date.now() - startTime}ms`
    }
  });
}

console.log(`✅ Acceso permitido para IP: ${ip} (${Date.now() - startTime}ms)`);
return NextResponse.next();
```

} catch (error) {
console.error(`Error general en middleware para IP ${ip}:`, error);

```
// En caso de error crítico, permitir acceso pero loguear
return NextResponse.next();
```

}
}

export const config = {
matcher: [
/*
* Aplicar a todas las rutas excepto:
* - API routes (/api/*)
* - Static files (_next/static/*)
* - Image optimization (_next/image/*)
* - Favicon y archivos de assets
*/
’/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)’,
],
};
