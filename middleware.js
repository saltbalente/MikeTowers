// middleware.js
// Edge Function compatible middleware

export const config = {
  runtime: 'edge',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

const PROXYCHECK_API_KEY = process.env.PROXYCHECK_API_KEY || "7w48yx-406284-067674-wi3016";

// Cache en memoria para reducir llamadas DNS y API
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getClientIP(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (forwardedFor) {
    const firstIP = forwardedFor.split(",")[0].trim();
    if (isValidIP(firstIP)) return firstIP;
  }
  
  if (realIP && isValidIP(realIP)) return realIP;
  if (cfConnectingIP && isValidIP(cfConnectingIP)) return cfConnectingIP;
  
  const ip = request.ip;
  if (ip && isValidIP(ip)) return ip;
  
  return null;
}

function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split(".").every(octet => {
      const num = parseInt(octet);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip) && ip.length <= 39;
}

function isLocalIP(ip) {
  const localRanges = [
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^::1$/,
    /^fe80:/,
  ];
  
  return localRanges.some(range => range.test(ip));
}

function getCachedResult(key) {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return { result: cached.result, type: cached.type };
  }
  
  if (cached) cache.delete(key);
  return null;
}

function setCacheResult(key, result, type) {
  cache.set(key, {
    result,
    type,
    timestamp: Date.now()
  });
  
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_DURATION) {
        cache.delete(k);
      }
    }
  }
}

async function isGoogleBot(request) {
  // Check User-Agent for Googlebot
  const userAgent = request.headers.get("user-agent") || "";
  const isGoogleBotUA = userAgent.toLowerCase().includes("googlebot");
  
  if (!isGoogleBotUA) {
    return false;
  }
  
  // Additional verification could be done here with external API if needed
  // For now, we'll trust the User-Agent for Edge Function compatibility
  return true;
}

async function checkVPN(ip) {
  try {
    const cached = getCachedResult(`vpn_${ip}`);
    if (cached !== null) {
      return { isVPN: cached.result, details: { cached: true, type: cached.type } };
    }

    const proxyCheckUrl = `https://proxycheck.io/v2/${ip}?key=${PROXYCHECK_API_KEY}&vpn=1&asn=1&risk=1&port=1&seen=1&days=7&tag=vercel-protection`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(proxyCheckUrl, { 
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VercelBot/1.0)"
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
        result.proxy === "yes" || 
        result.vpn === "yes" || 
        result.type === "VPN" ||
        (result.risk && result.risk > 75)
      );
      
      setCacheResult(`vpn_${ip}`, isVPN, result.type || "proxy");
      
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

    setCacheResult(`vpn_${ip}`, false, "clean");
    return { isVPN: false };

  } catch (error) {
    console.error(`Error al verificar VPN para IP ${ip}:`, error);
    return { isVPN: false, details: { error: error.message } };
  }
}

export default async function middleware(request) {
  console.log('🔍 Middleware ejecutándose para:', request.url);
  const startTime = Date.now();
  
  const ip = getClientIP(request);
  console.log('📍 IP detectada:', ip);

  if (!ip) {
    console.warn("No se pudo obtener la IP del usuario. Acceso denegado por seguridad.");
    return new Response("Error: No se pudo verificar la dirección IP", {
      status: 400,
      headers: {
        "X-Blocked-Reason": "IP-Not-Detected"
      }
    });
  }

  if (isLocalIP(ip)) {
    console.log(`Permitido: IP local/privada detectada: ${ip}`);
    return;
  }

  try {
    const isBot = await isGoogleBot(request);
    if (isBot) {
      console.log(`✅ Permitido: Googlebot verificado para IP: ${ip} (${Date.now() - startTime}ms)`);
      return;
    }

    const vpnCheck = await checkVPN(ip);
    
    if (vpnCheck.isVPN) {
      const details = vpnCheck.details;
      console.log(`🚫 Acceso denegado para IP: ${ip}. Detalles:`, details);
      
      return new Response("Acceso denegado: Se ha detectado el uso de un VPN o proxy.", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Blocked-Reason": "VPN-Proxy-Detected",
          "X-Blocked-Type": details?.type || "unknown",
          "X-Response-Time": `${Date.now() - startTime}ms`
        }
      });
    }

    console.log(`✅ Acceso permitido para IP: ${ip} (${Date.now() - startTime}ms)`);
    return;

  } catch (error) {
    console.error(`Error general en middleware para IP ${ip}:`, error);
    return;
  }
}
