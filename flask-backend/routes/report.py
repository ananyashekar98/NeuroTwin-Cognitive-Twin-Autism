from flask import Blueprint, make_response
from database import read_db
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io

report_bp = Blueprint('report', __name__)

# Colours
BLUE        = colors.HexColor('#3a6cf4')
BLUE_DARK   = colors.HexColor('#2450c8')
BLUE_LIGHT  = colors.HexColor('#eef2ff')
RED         = colors.HexColor('#ef4444')
RED_LIGHT   = colors.HexColor('#fff0f0')
AMBER       = colors.HexColor('#f59e0b')
AMBER_LIGHT = colors.HexColor('#fffbeb')
GREEN       = colors.HexColor('#10b981')
GREEN_LIGHT = colors.HexColor('#ecfdf5')
PURPLE      = colors.HexColor('#8b5cf6')
GRAY_DARK   = colors.HexColor('#0f1729')
GRAY_MID    = colors.HexColor('#4b5c7a')
GRAY_LIGHT  = colors.HexColor('#f8fafc')
GRAY_BORDER = colors.HexColor('#e5eaf2')
WHITE       = colors.white

W = 170 * mm  # page content width

def s(name, **kw):
    defaults = dict(fontName='Helvetica', fontSize=10, textColor=GRAY_DARK, leading=14)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

def fmt_date(d):
    if not d: return '—'
    try: return datetime.fromisoformat(str(d)[:19]).strftime('%d %b %Y  %I:%M %p')
    except: return str(d)[:16]

def section_bar(title, color=BLUE):
    t = Table([[Paragraph(f'  {title}',
        s('sb', fontName='Helvetica-Bold', fontSize=11, textColor=WHITE))]],
        colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), color),
        ('TOPPADDING',    (0,0),(-1,-1), 8),
        ('BOTTOMPADDING', (0,0),(-1,-1), 8),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ]))
    return t

def kv_table(pairs):
    rows = [[Paragraph(k, s('kl', fontName='Helvetica-Bold', fontSize=9, textColor=GRAY_MID)),
             Paragraph(str(v) if v else '—', s('kv', fontSize=10))]
            for k, v in pairs]
    t = Table(rows, colWidths=[55*mm, 115*mm])
    t.setStyle(TableStyle([
        ('ROWBACKGROUNDS', (0,0),(-1,-1), [WHITE, GRAY_LIGHT]),
        ('GRID',          (0,0),(-1,-1), 0.4, GRAY_BORDER),
        ('TOPPADDING',    (0,0),(-1,-1), 7),
        ('BOTTOMPADDING', (0,0),(-1,-1), 7),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ]))
    return t

def data_tbl(headers, rows, widths):
    hrow = [Paragraph(h, s('th', fontName='Helvetica-Bold', fontSize=8.5,
                            textColor=WHITE, alignment=TA_CENTER)) for h in headers]
    t = Table([hrow] + rows, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,0), BLUE),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [WHITE, GRAY_LIGHT]),
        ('GRID',          (0,0),(-1,-1), 0.4, GRAY_BORDER),
        ('TOPPADDING',    (0,0),(-1,-1), 6),
        ('BOTTOMPADDING', (0,0),(-1,-1), 6),
        ('LEFTPADDING',   (0,0),(-1,-1), 6),
        ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    return t

def intensity_p(val):
    try:
        v = int(val)
        c = RED if v >= 7 else AMBER if v >= 4 else GREEN
        return Paragraph(f'{v}/10', s('ip', fontName='Helvetica-Bold', fontSize=9,
                                       textColor=c, alignment=TA_CENTER))
    except: return Paragraph(str(val), s('ip2', fontSize=9, alignment=TA_CENTER))

def risk_p(score):
    try:
        v = int(score)
        c = RED if v >= 70 else AMBER if v >= 40 else GREEN
        label = 'High' if v >= 70 else 'Med' if v >= 40 else 'Low'
        return Paragraph(f'{v}%  {label}', s('rp', fontName='Helvetica-Bold',
                                               fontSize=9, textColor=c, alignment=TA_CENTER))
    except: return Paragraph(str(score), s('rp2', fontSize=9, alignment=TA_CENTER))

def stat_boxes(items):
    cells = []
    bgs   = [RED_LIGHT, BLUE_LIGHT, AMBER_LIGHT, GREEN_LIGHT]
    for i, (icon, val, label) in enumerate(items):
        cell = Table([
            [Paragraph(icon,  s(f'si{i}', fontSize=22, alignment=TA_CENTER))],
            [Paragraph(f'<b>{val}</b>',  s(f'sv{i}', fontName='Helvetica-Bold',
                        fontSize=20, textColor=GRAY_DARK, alignment=TA_CENTER))],
            [Paragraph(label, s(f'sl{i}', fontSize=8, textColor=GRAY_MID,
                        alignment=TA_CENTER))],
        ], colWidths=[W/4 - 2])
        cell.setStyle(TableStyle([
            ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
            ('TOPPADDING',    (0,0),(-1,-1), 4),
            ('BOTTOMPADDING', (0,0),(-1,-1), 4),
        ]))
        cells.append(cell)
    outer = Table([cells], colWidths=[W/4]*4)
    style = [
        ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('GRID',          (0,0),(-1,-1), 0.5, GRAY_BORDER),
        ('TOPPADDING',    (0,0),(-1,-1), 12),
        ('BOTTOMPADDING', (0,0),(-1,-1), 12),
    ]
    for i, bg in enumerate(bgs):
        style.append(('BACKGROUND', (i,0), (i,0), bg))
    outer.setStyle(TableStyle(style))
    return outer


@report_bp.route('/<user_id>', methods=['GET'])
def generate_report(user_id):
    db         = read_db()
    profile    = next((p for p in db.get('profiles',   []) if p.get('userId') == user_id), {})
    breakdowns = [b for b in db.get('breakdowns', []) if b.get('userId') == user_id]
    schedules  = [s for s in db.get('schedules',  []) if s.get('userId') == user_id]
    moods      = [m for m in db.get('moods',      []) if m.get('userId') == user_id]
    dailylogs  = [d for d in db.get('dailylogs',  []) if d.get('userId') == user_id]

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=18*mm, bottomMargin=18*mm)
    story = []

    # ── Header ─────────────────────────────────────────────────────
    ht = Table([[
        Paragraph('<b>🧠 CognitiveTwin ASD</b>',
                  s('logo', fontName='Helvetica-Bold', fontSize=15, textColor=BLUE)),
        Paragraph('Global Academy of Technology<br/>'
                  '<font size="8" color="#8496b0">Dept. of ISE  |  Major Project 2025-26</font>',
                  s('hdr', fontSize=10, textColor=GRAY_DARK, alignment=TA_RIGHT))
    ]], colWidths=[85*mm, 85*mm])
    ht.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                             ('TOPPADDING',(0,0),(-1,-1),0),
                             ('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    story.append(ht)
    story.append(HRFlowable(width=W, thickness=2, color=BLUE, spaceAfter=10))

    name = profile.get('name', user_id)
    story.append(Paragraph('Patient Behavioral Report',
                 s('title', fontName='Helvetica-Bold', fontSize=20,
                   textColor=GRAY_DARK, alignment=TA_CENTER, spaceAfter=2)))
    story.append(Paragraph(
        f'Generated on {datetime.now().strftime("%d %B %Y at %I:%M %p")}',
        s('sub', fontSize=10, textColor=GRAY_MID, alignment=TA_CENTER, spaceAfter=6)))
    story.append(HRFlowable(width=W, thickness=0.5, color=GRAY_BORDER, spaceAfter=14))

    # ── Stat boxes ─────────────────────────────────────────────────
    avg_risk = round(sum(sc.get('riskScore',0) for sc in schedules)/len(schedules),1) if schedules else 0
    story.append(stat_boxes([
        ('⚡', str(len(breakdowns)), 'Total Breakdowns'),
        ('📅', str(len(schedules)),  'Schedules Logged'),
        ('🎯', f'{avg_risk}%',       'Avg Risk Score'),
        ('😊', str(len(moods)),      'Mood Entries'),
    ]))
    story.append(Spacer(1, 18))

    # ── Section 1 — Profile ────────────────────────────────────────
    story.append(section_bar('① Patient Profile'))
    story.append(Spacer(1, 6))

    def listify(v):
        if isinstance(v, list): return ', '.join(v)
        return str(v) if v else '—'

    story.append(kv_table([
        ('Full Name',            profile.get('name', '—')),
        ('Age',                  profile.get('age', '—')),
        ('ASD Level',            profile.get('asdLevel', '—')),
        ('Gender',               profile.get('gender', '—')),
        ('Caregiver Name',       profile.get('caregiverName', '—')),
        ('Caregiver Phone',      profile.get('caregiverPhone', '—')),
        ('School / Clinic',      profile.get('school', '—')),
        ('Primary Triggers',     listify(profile.get('triggers', '—'))),
        ('Calming Methods',      listify(profile.get('calmingMethods', '—'))),
        ('Sensory Sensitivities',profile.get('sensorySensitivities', '—')),
        ('Communication Style',  profile.get('communicationStyle', '—')),
        ('Last Updated',         fmt_date(profile.get('updatedAt',''))),
    ]))
    story.append(Spacer(1, 16))

    # ── Section 2 — Breakdowns ─────────────────────────────────────
    story.append(section_bar('② Breakdown Event History', RED))
    story.append(Spacer(1, 6))
    if breakdowns:
        rows = []
        for b in sorted(breakdowns, key=lambda x: x.get('date',''), reverse=True)[:15]:
            rows.append([
                Paragraph(fmt_date(b.get('date','')), s('td', fontSize=8.5, alignment=TA_CENTER)),
                Paragraph(str(b.get('trigger','—')),  s('td2',fontSize=9,  alignment=TA_CENTER)),
                intensity_p(b.get('intensity','—')),
                Paragraph(f"{b.get('duration','—')} min", s('td3',fontSize=9, alignment=TA_CENTER)),
                Paragraph(str(b.get('notes','—'))[:40],   s('td4',fontSize=8.5, alignment=TA_LEFT)),
            ])
        story.append(data_tbl(
            ['Date & Time','Trigger','Intensity','Duration','Notes'],
            rows, [42*mm, 30*mm, 22*mm, 22*mm, 54*mm]))
    else:
        story.append(Paragraph('ℹ  No breakdown events logged yet.',
                     s('em', fontSize=10, textColor=GRAY_MID)))
    story.append(Spacer(1, 16))

    # ── Section 3 — Schedule Risk ──────────────────────────────────
    story.append(section_bar('③ Schedule Risk Analysis', BLUE_DARK))
    story.append(Spacer(1, 6))
    if schedules:
        rows = []
        for sc in schedules[:12]:
            rows.append([
                Paragraph(str(sc.get('activity','—')),     s('td5',fontSize=9, alignment=TA_LEFT)),
                Paragraph(str(sc.get('startTime','—')),    s('td6',fontSize=9, alignment=TA_CENTER)),
                Paragraph(str(sc.get('activityType','—')), s('td7',fontSize=9, alignment=TA_CENTER)),
                Paragraph(str(sc.get('environment','—')),  s('td8',fontSize=9, alignment=TA_CENTER)),
                risk_p(sc.get('riskScore', 0)),
            ])
        story.append(data_tbl(
            ['Activity','Start Time','Type','Environment','Risk Score'],
            rows, [50*mm, 25*mm, 30*mm, 30*mm, 35*mm]))
    else:
        story.append(Paragraph('ℹ  No schedule data logged yet.',
                     s('em2', fontSize=10, textColor=GRAY_MID)))
    story.append(Spacer(1, 16))

    # ── Section 4 — Mood ──────────────────────────────────────────
    story.append(section_bar('④ Mood Tracker History', PURPLE))
    story.append(Spacer(1, 6))
    if moods:
        rows = []
        for m in sorted(moods, key=lambda x: x.get('date',''), reverse=True)[:10]:
            rows.append([
                Paragraph(fmt_date(m.get('date','')),    s('td9',  fontSize=8.5, alignment=TA_CENTER)),
                Paragraph(str(m.get('mood','—')),        s('td10', fontSize=9,   alignment=TA_CENTER)),
                Paragraph(str(m.get('note','—'))[:55],   s('td11', fontSize=8.5, alignment=TA_LEFT)),
            ])
        story.append(data_tbl(['Date & Time','Mood','Note'],
                               rows, [55*mm, 35*mm, 80*mm]))
    else:
        story.append(Paragraph('ℹ  No mood entries logged yet.',
                     s('em3', fontSize=10, textColor=GRAY_MID)))
    story.append(Spacer(1, 16))

    # ── Section 5 — Daily Log ─────────────────────────────────────
    story.append(section_bar('⑤ Daily Activity Log', GREEN))
    story.append(Spacer(1, 6))
    if dailylogs:
        rows = []
        for d in sorted(dailylogs, key=lambda x: x.get('date',''), reverse=True)[:10]:
            rows.append([
                Paragraph(fmt_date(d.get('date','')),       s('td12', fontSize=8.5, alignment=TA_CENTER)),
                Paragraph(str(d.get('activity','—')),       s('td13', fontSize=9,   alignment=TA_LEFT)),
                Paragraph(str(d.get('mood','—')),           s('td14', fontSize=9,   alignment=TA_CENTER)),
                Paragraph(str(d.get('notes','—'))[:40],     s('td15', fontSize=8.5, alignment=TA_LEFT)),
            ])
        story.append(data_tbl(['Date','Activity','Mood','Notes'],
                               rows, [42*mm, 45*mm, 28*mm, 55*mm]))
    else:
        story.append(Paragraph('ℹ  No daily logs recorded yet.',
                     s('em4', fontSize=10, textColor=GRAY_MID)))
    story.append(Spacer(1, 16))

    # ── Section 6 — Recommendations ──────────────────────────────
    story.append(section_bar('⑥ Personalized Recommendations', AMBER))
    story.append(Spacer(1, 8))

    top_trigger = None
    if breakdowns:
        from collections import Counter
        top_trigger = Counter(b.get('trigger','') for b in breakdowns).most_common(1)[0][0]

    recs = [
        ('🎵', 'Calming Music Before Transitions',
         'Play soft instrumental music 5-10 minutes before any schedule change. '
         'Studies show this reduces transition anxiety by up to 70%.'),
        ('🗓️', 'Use Visual Schedules Daily',
         'Display the day plan in picture/icon format every morning. '
         'Predictability is essential for emotional regulation in ASD.'),
        ('🤫', 'Manage Sensory Environment',
         f'The most frequent trigger identified is: {top_trigger or "sensory input"}. '
         'Use noise-cancelling headphones, dim lighting, or calm spaces proactively.'),
        ('🫁', '4-7-8 Breathing Before High-Risk Windows',
         'Before high-risk schedule periods, practice: inhale 4s, hold 7s, exhale 8s. '
         'This activates the parasympathetic system and reduces stress response.'),
        ('📋', 'Maintain Consistent Daily Routines',
         'Prepare for any change 10-15 minutes in advance with verbal/visual cues. '
         'Sudden changes are a primary stressor for ASD individuals.'),
    ]

    for icon, title, desc in recs:
        rt = Table([[
            Paragraph(icon, s(f'ri_{title[:4]}', fontSize=20, alignment=TA_CENTER)),
            [Paragraph(f'<b>{title}</b>', s(f'rtitle_{title[:4]}', fontName='Helvetica-Bold',
                        fontSize=10, textColor=GRAY_DARK, spaceAfter=3)),
             Paragraph(desc, s(f'rdesc_{title[:4]}', fontSize=9, textColor=GRAY_MID, leading=13))]
        ]], colWidths=[18*mm, 152*mm])
        rt.setStyle(TableStyle([
            ('VALIGN',        (0,0),(-1,-1), 'TOP'),
            ('BACKGROUND',    (0,0),(-1,-1), GRAY_LIGHT),
            ('BOX',           (0,0),(-1,-1), 0.5, GRAY_BORDER),
            ('TOPPADDING',    (0,0),(-1,-1), 9),
            ('BOTTOMPADDING', (0,0),(-1,-1), 9),
            ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ]))
        story.append(rt)
        story.append(Spacer(1, 6))

    # ── Footer ────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width=W, thickness=0.5, color=GRAY_BORDER, spaceAfter=8))
    story.append(Paragraph(
        'This report is auto-generated by the CognitiveTwin ASD Support System. '
        'For caregiver and clinical use only. '
        'Global Academy of Technology, Dept. of ISE — Major Project AY 2025-26.',
        s('foot', fontSize=8, textColor=GRAY_MID, alignment=TA_CENTER)))

    doc.build(story)
    buf.seek(0)

    safe = name.replace(' ', '_') if name else user_id
    resp = make_response(buf.read())
    resp.headers['Content-Type']        = 'application/pdf'
    resp.headers['Content-Disposition'] = f'attachment; filename=CognitiveTwin_{safe}_Report.pdf'
    return resp
