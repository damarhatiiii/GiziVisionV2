import { NextResponse } from 'next/server';
import os from 'os';

export async function GET(request) {
  const hostHeader = request.headers.get('host') || 'localhost:3000';
  const port = hostHeader.split(':')[1] || '3000';
  
  const interfaces = os.networkInterfaces();
  let ipAddress = 'localhost';
  
  // Find the first external IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress !== 'localhost') break;
  }
  
  return NextResponse.json({
    localIp: ipAddress,
    port: port,
    localUrl: `http://${ipAddress}:${port}`
  });
}
