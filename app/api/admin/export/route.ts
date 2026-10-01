import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { filterLeadsForExport, generateLeadsCsv } from '@/lib/exportCsv';

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: Inpartner administrative privileges required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const allLeads = getAllLeads();
    const filteredLeads = filterLeadsForExport(allLeads, {
      startDate,
      endDate,
      status,
      priority
    });

    const csvContent = generateLeadsCsv(filteredLeads);
    const filename = `inpartner-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

