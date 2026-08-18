import { NextRequest } from 'next/server';
import { runSecurityScan } from '@/lib/scanner/engine';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL parameter is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const user = await getAuthUser(req);

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        sendEvent('step', { step: 1, name: 'DNS Socket Interception', status: 'RUNNING' });
        await new Promise((r) => setTimeout(r, 400));

        sendEvent('step', { step: 2, name: 'WHOIS Registry & Domain Age', status: 'RUNNING' });
        await new Promise((r) => setTimeout(r, 450));

        sendEvent('step', { step: 3, name: 'SSL/TLS Cert Security Verification', status: 'RUNNING' });
        await new Promise((r) => setTimeout(r, 500));

        sendEvent('step', { step: 4, name: 'DOM Behavioral & Form Inspection', status: 'RUNNING' });
        await new Promise((r) => setTimeout(r, 500));

        sendEvent('step', { step: 5, name: 'Visual Similarity & Typo-Squatting Check', status: 'RUNNING' });
        await new Promise((r) => setTimeout(r, 400));

        sendEvent('step', { step: 6, name: 'Final Verdict & AI Terminal Analysis', status: 'RUNNING' });
        
        // Execute security scan engine
        const scanResult = await runSecurityScan(url);

        // Save scan result to Database
        const savedRecord = await db.scanResult.create({
          data: {
            userId: user?.id || null,
            url: scanResult.url,
            domain: scanResult.domain,
            ipAddress: scanResult.ipAddress,
            status: 'COMPLETED',
            overallScore: scanResult.overallScore,
            verdict: scanResult.verdict,
            dnsData: JSON.stringify(scanResult.dnsData),
            whoisData: JSON.stringify(scanResult.whoisData),
            sslData: JSON.stringify(scanResult.sslData),
            domData: JSON.stringify(scanResult.domData),
            visualData: JSON.stringify(scanResult.visualData),
            aiExplanation: scanResult.aiExplanation,
            stepTimings: JSON.stringify(scanResult.stepTimings),
          },
        });

        sendEvent('complete', {
          id: savedRecord.id,
          ...scanResult,
          createdAt: savedRecord.createdAt,
        });

        controller.close();
      } catch (err: any) {
        sendEvent('error', { message: err.message || 'Stream processing failed' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
