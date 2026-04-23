import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import QRCode from "qrcode";
import dbConnect from "@/lib/db/connection";
import { Owner } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";

function buildLetterHtml(params: {
  ownerName: string;
  cnic: string;
  phone: string;
  residentOf: string;
  regNo: string;
  unitNo: string;
  unitType: string;
  floor: string;
  netArea: string;
  type: "allotment" | "transfer";
  transferDate?: string;
  verifyUrl: string;
  qrDataUrl: string;
  photoUrl?: string;
  logoUrl: string;
  watermarkUrl: string;
}) {
  const letterTitle = "Provisional Allotment Letter";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${letterTitle}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", serif; background:#f3f3f3; margin:0; padding:8px; color:#111; }
    .outer {
      width:210mm;
      height:297mm;
      margin:0 auto;
      border:2px solid #111;
      background:#fff;
      padding:2px;
      overflow:hidden;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    .page {
      border:1px solid #1f1f1f;
      padding:10px 12px 8px;
      height:100%;
      position:relative;
      overflow:hidden;
      display:flex;
      flex-direction:column;
    }
    .topContent { }
    .logo { text-align:center; margin-bottom:6px; line-height:1.1; }
    .logo img { width:140px; height:auto; object-fit:contain; }
    .metaRow { display:grid; grid-template-columns:1fr 1px 1fr; background:#f1f4fa; margin-top:4px; }
    .metaCell { padding:8px 12px; font-size:13px; font-weight:700; color:#9c7a27; }
    .metaCell span { color:#111; font-weight:600; }
    .metaDivider { background:#8f8f8f; }
    .lineField {
      display:inline-flex;
      min-width:90px;
      border-bottom:1px solid #808080;
      line-height:1;
      transform:translateY(-2px);
      margin-left:2px;
      align-items:center;
      justify-content:center;
      text-align:center;
      vertical-align:middle;
    }
    .title { text-align:center; font-size:40px; font-family: "Brush Script MT", "Lucida Handwriting", cursive; margin:18px 0 10px; color:#10243f; text-decoration:underline; font-weight:600; }
    .row { display:flex; gap:10px; }
    .panel { border:2px solid #2d2d2d; flex:1; background:#fff; }
    .panel h3 { margin:0; padding:7px 10px; background:#fadfb1; font-size:22px; line-height:1.1; letter-spacing:0.2px; }
    .grid { display:grid; grid-template-columns:220px 1fr; border-top:1px solid #b5a15f; }
    .cell { padding:8px 10px; border-bottom:1px solid #b5a15f; border-right:1px solid #b5a15f; font-size:17px; min-height:34px; }
    .cell:last-child { border-right:none; }
    .cell.label { font-weight:700; font-size:16px; }
    .photoBox { width:188px; border:2px solid #2d2d2d; display:flex; align-items:center; justify-content:center; background:#eef4fc; overflow:hidden; height:196px; }
    .photoBox img { width:100%; height:100%; object-fit:cover; object-position:center; }
    .unitPanel { border:2px solid #2d2d2d; margin-top:14px; }
    .unitPanel h3 { margin:0; padding:7px 10px; background:#fadfb1; font-size:22px; line-height:1.1; letter-spacing:0.2px; }
    .unitGrid { display:grid; grid-template-columns:repeat(4, 1fr); border-top:1px solid #b7a26a; }
    .unitCell { padding:9px 10px; border-right:1px solid #b7a26a; min-height:76px; }
    .unitCell:last-child { border-right:none; }
    .unitCell .k { font-size:14px; font-weight:700; }
    .unitCell .v { font-size:14px; margin-top:12px; }
    .unitCell .line { display:inline-block; width:100px; border-bottom:1px solid #7f7f7f; transform:translateY(-2px); }
    .watermark {
      display:flex;
      justify-content:center;
      align-items:center;
      margin-top:20px;
      user-select:none;
      opacity:0.14;
    }
    .watermark img {
      width:auto;
      /* max-width: 92%; */
      height:215px;
      object-fit:cover;
    }
    .bottomSection { margin-top:auto; }
    .footRow { display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px; }
    .signature { width:300px; border-top:1px solid #999; padding-top:8px; font-size:14px; }
    .qr { text-align:center; width:140px; }
    .qr img { width:120px; height:120px; border:1px solid #bbb; padding:4px; background:#fff; }
    .scan { color:#b0892f; font-weight:700; margin-top:6px; font-size:14px; }
    .note { margin-top:10px; border-top:1px solid #ddd; padding-top:6px; font-size:12px; color:#333; line-height:1.35; }
    .site { text-align:center; margin-top:12px; font-size:14px; color:#0f172a; font-weight:700; line-height:1.35; }
    .verify { margin-top:6px; font-size:11px; color:#6b7280; word-break:break-all; }
    @media print {
      body { background:#fff; padding:0; }
      .outer { margin:0; border:2px solid #111; width:210mm; height:297mm; }
    }
  </style>
</head>
<body>
  <div class="outer">
  <div class="page">
    <div class="topContent">
    <div class="logo">
      <img src="${params.logoUrl}" alt="One Capital Builders Logo" />
    </div>
    <div class="metaRow">
      <div class="metaCell">File No:<span class="lineField">${params.regNo}</span></div>
      <div class="metaDivider"></div>
      <div class="metaCell" style="text-align:right;">Date:<span class="lineField">${params.transferDate || new Date().toISOString().split("T")[0]}</span></div>
    </div>
    <div class="title">${letterTitle}</div>

    <div class="row">
      <div class="panel">
        <h3>ALLOTTEE INFORMATION</h3>
        <div class="grid">
          <div class="cell label">Mr / Mrs / Miss</div><div class="cell">${params.ownerName}</div>
          <div class="cell label">CNIC No.</div><div class="cell">${params.cnic}</div>
          <div class="cell label">Resident of</div><div class="cell">${params.residentOf || "-"}</div>
        </div>
      </div>
      <div class="photoBox">${params.photoUrl ? `<img src="${params.photoUrl}" alt="Owner photo" />` : `<span style="color:#334155;font-weight:700;">OWNER PHOTO</span>`}</div>
    </div>

    <div class="unitPanel">
      <h3>UNIT DETAILS</h3>
      <div class="unitGrid">
        <div class="unitCell"><div class="k">Unit No.</div><div class="v">${params.unitNo || '<span class="line"></span>'}</div></div>
        <div class="unitCell"><div class="k">Type</div><div class="v">${params.unitType || '<span class="line"></span>'}</div></div>
        <div class="unitCell"><div class="k">Floor</div><div class="v">${params.floor || '<span class="line"></span>'}</div></div>
        <div class="unitCell"><div class="k">Net Area</div><div class="v">${params.netArea || '<span class="line"></span>'}</div></div>
      </div>
    </div>

    <div class="watermark">
      <img src="${params.watermarkUrl}" alt="7Sky watermark" />
    </div>
    </div>

    <div class="bottomSection">
    <div class="footRow">
      <div class="signature">
        <strong>Authorized Signatory</strong><br/>
        One Capital Builders<br/><br/>
        Signature & Stamp
      </div>
      <div class="qr">
        <img src="${params.qrDataUrl}" alt="Verify ownership QR" />
        <div class="scan">Scan to Verify</div>
      </div>
    </div>

    <div class="note">
      <strong>Note:</strong> This allotment is subject to the terms and conditions of One Capital Builders. The allottee is required to comply with all payment schedules and construction regulations of 7Sky Commercial Plaza, G-14 Markaz, Islamabad.
      <div class="verify">Verification URL: ${params.verifyUrl}</div>
    </div>
    <div class="site">
      7Sky Plot 19-A G-14 Markaz Islamabad<br/>
      www.onecapitalbuilders.com
    </div>
    </div>
  </div>
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
    }

    const type = request.nextUrl.searchParams.get("type") === "transfer" ? "transfer" : "allotment";

    await dbConnect();
    const ownerDoc = await Owner.findById(id).populate("unitId", "unitNumber floor type size");
    if (!ownerDoc) return NextResponse.json({ error: "Owner not found" }, { status: 404 });

    const owner = ownerDoc.toObject();

    const unit = owner.unitId as { unitNumber?: string; floor?: string; type?: string; size?: number } | null;
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
    const verifyUrl = `${appBaseUrl}/verify-ownership/${encodeURIComponent(owner.registrationNumber)}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 256 });
    const latestTransfer = owner.transferHistory?.[owner.transferHistory.length - 1];

    const logoUrl = `${appBaseUrl}/ONE%20CAPITAL%20NEW%20BLACK%20FONT.png`;
    const watermarkUrl = `${appBaseUrl}/7Sky%20300%20DPI.png`;

    const html = buildLetterHtml({
      ownerName: owner.ownerName,
      cnic: owner.cnic || "N/A",
      phone: owner.phone || "",
      residentOf: owner.residentOf || "",
      regNo: owner.registrationNumber,
      unitNo: unit?.unitNumber || "-",
      unitType: unit?.type ? `${unit.type.charAt(0).toUpperCase()}${unit.type.slice(1)}` : "-",
      floor: unit?.floor || "-",
      netArea: unit?.size ? `${unit.size} sqft` : "-",
      type,
      transferDate: latestTransfer?.transferredAt
        ? new Date(latestTransfer.transferredAt).toISOString().split("T")[0]
        : undefined,
      verifyUrl,
      qrDataUrl,
      photoUrl: owner.photoUrl || "",
      logoUrl,
      watermarkUrl,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Owner letter generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
