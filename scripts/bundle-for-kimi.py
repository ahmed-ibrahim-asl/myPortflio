import os
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

WORKSPACE = Path(r"D:\work\portflioWebsite\myPortfolio")
TXT_OUTPUT = WORKSPACE / "portfolio_codebase.txt"
PDF_OUTPUT = WORKSPACE / "portfolio_codebase.pdf"

TARGET_EXTS = {".js", ".jsx", ".mjs", ".json", ".css", ".md", ".py", ".svg", ".txt"}
EXCLUDE_DIRS = {"node_modules", ".next", "out", ".git", ".system_generated", "scratch", "brain"}

FILES_TO_INCLUDE = [
    "AGENTS.md",
    "CLAUDE.md",
    "EASE-REPORT.md",
    "README.md",
    "package.json",
    "next.config.mjs",
    "jsconfig.json",
]

DIRS_TO_TRAVERSE = [
    "app",
    "components",
    "data",
    "lib",
    "content",
    "docs",
    "scripts",
]

def collect_files():
    file_list = []
    
    for f in FILES_TO_INCLUDE:
        p = WORKSPACE / f
        if p.is_file():
            file_list.append(p)
            
    for d in DIRS_TO_TRAVERSE:
        dir_path = WORKSPACE / d
        if not dir_path.is_dir():
            continue
        for root, dirs, files in os.walk(dir_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                fp = Path(root) / file
                if fp.suffix.lower() in TARGET_EXTS and fp.stat().st_size < 500000:
                    file_list.append(fp)
                    
    # Sort files predictably
    file_list.sort(key=lambda x: str(x.relative_to(WORKSPACE)))
    return file_list

def create_txt_bundle(files):
    print(f"Creating TXT bundle at {TXT_OUTPUT}...")
    with open(TXT_OUTPUT, "w", encoding="utf-8") as out:
        out.write("================================================================================\n")
        out.write("AHMED ASL PORTFOLIO - FULL CODEBASE & DOCUMENTATION BUNDLE FOR KIMI\n")
        out.write("================================================================================\n\n")
        
        for fp in files:
            rel_path = fp.relative_to(WORKSPACE)
            out.write(f"\n{'='*80}\n")
            out.write(f"FILE: {rel_path}\n")
            out.write(f"{'='*80}\n\n")
            try:
                content = fp.read_text(encoding="utf-8", errors="replace")
                out.write(content)
                out.write("\n")
            except Exception as e:
                out.write(f"[Error reading file: {e}]\n")
                
    print(f"TXT bundle created successfully ({TXT_OUTPUT.stat().st_size / (1024*1024):.2f} MB).")

def create_pdf_bundle(files):
    print(f"Creating PDF document at {PDF_OUTPUT}...")
    doc = SimpleDocTemplate(
        str(PDF_OUTPUT),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#060814'),
        spaceAfter=12
    )
    
    file_header_style = ParagraphStyle(
        'FileHeader',
        parent=styles['Heading2'],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#30395e'),
        spaceBefore=14,
        spaceAfter=6
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#1a1a1a'),
        backColor=colors.HexColor('#f5f5f5'),
        borderColor=colors.HexColor('#cccccc'),
        borderWidth=0.5,
        borderPadding=4,
        spaceAfter=10
    )

    story = []
    story.append(Paragraph("Ahmed Asl Portfolio - Codebase & Documentation PDF", title_style))
    story.append(Paragraph("Bundled for direct upload to Kimi / Moonshot AI", styles['Normal']))
    story.append(Spacer(1, 14))
    
    story.append(Paragraph("Table of Files Included:", styles['Heading3']))
    for fp in files:
        rel_path = str(fp.relative_to(WORKSPACE))
        story.append(Paragraph(f"• {rel_path}", styles['Normal']))
        
    story.append(PageBreak())
    
    # Add key files to PDF (limit size to keep PDF clean and under limits)
    max_pdf_files = 30
    for i, fp in enumerate(files[:max_pdf_files]):
        rel_path = str(fp.relative_to(WORKSPACE))
        story.append(Paragraph(f"File ({i+1}/{len(files[:max_pdf_files])}): {rel_path}", file_header_style))
        try:
            content = fp.read_text(encoding="utf-8", errors="replace")
            # Truncate extremely long files in PDF version if > 300 lines
            lines = content.splitlines()
            if len(lines) > 300:
                content = "\n".join(lines[:300]) + f"\n... [Truncated {len(lines)-300} lines in PDF preview - see TXT bundle for full text]"
            
            # Escape HTML characters for reportlab Paragraph/Preformatted
            safe_text = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            story.append(Preformatted(safe_text, code_style))
        except Exception as e:
            story.append(Paragraph(f"Error reading file: {e}", styles['Normal']))
        story.append(Spacer(1, 10))

    try:
        doc.build(story)
        print(f"PDF document created successfully ({PDF_OUTPUT.stat().st_size / (1024*1024):.2f} MB).")
    except Exception as e:
        print(f"PDF build warning: {e}")

if __name__ == "__main__":
    files = collect_files()
    create_txt_bundle(files)
    create_pdf_bundle(files)
