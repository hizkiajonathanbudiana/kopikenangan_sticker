export type BriefSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets?: string[];
  highlights?: Array<{
    title: string;
    bullets: string[];
  }>;
};

export const internalBriefIntro = {
  badge: "Internal briefing — Project Kenangan",
  title: "Culture-led LINE Sticker Lab",
  summary:
    "Reference deck: Aplikasi Desain Budaya dan Kreatif Digital (數位文創應用) — Opportunities in the Local Area by Cherish Olenda Kurniawan (114AT0013).",
};

export const briefSections: BriefSection[] = [
  {
    id: "deck-overview",
    label: "Deck overview",
    title: "Key facts from the thesis presentation",
    description:
      "Use these anchors whenever we cite the research backing this collaboration.",
    bullets: [
      "Topic: Aplikasi Desain Budaya dan Kreatif Digital (Digital Cultural & Creative Application).",
      "Strategic theme: Opportunities in the Local Area (生長地的契機).",
      "Author: Cherish Olenda Kurniawan — student ID 114AT0013.",
    ],
  },
  {
    id: "brand-background",
    label: "Brand background",
    title: "Kopi Kenangan snapshot",
    description: "Fast facts to keep the copy aligned with the brand story.",
    bullets: [
      "Founded in 2017 as a grab-and-go coffee chain with the mission of exporting Indonesian coffee culture.",
      "Operates 800+ stores across 45 cities with rapid regional expansion.",
      "Crossed 30 million cups served — momentum supports limited cultural drops like this.",
    ],
  },
  {
    id: "batik-motifs",
    label: "Cultural motifs",
    title: "Batik references powering Ka-Kun & Mega-Miu",
    description:
      "Each sticker set mirrors one heritage pattern; keep these story hooks on every deliverable.",
    highlights: [
      {
        title: "Kawung (Yogyakarta)",
        bullets: [
          "Recognizable for four perfectly mirrored ovals — historically reserved for royalty and court officials.",
          "Symbolism: balance, harmony, lotus-inspired purity, and palm-tree generosity for the community.",
          "Feeds Ka-Kun's wardrobe and the bold espresso palette.",
        ],
      },
      {
        title: "Mega Mendung (Cirebon)",
        bullets: [
          "Cloud motif born from the Pajajaran king's meditation; mega = sun/sky, mendung = overcast shelter.",
          "Reminds leaders to stay calm, gentle, and protective of their people.",
          "Inspires Mega-Miu's floating gradients and red-and-white scarf accent.",
        ],
      },
    ],
  },
  {
    id: "concept",
    label: "Concept",
    title: "Collab north star",
    description:
      "Why we mash coffee culture with textile heritage inside the LINE ecosystem.",
    bullets: [
      "Bridge contemporary coffee rituals with centuries-old Indonesian craftsmanship.",
      "Host tightly curated, time-limited retail moments that celebrate iconic motifs inside premium environments.",
      "Blend textile, F&B, and digital art workflows; use localized beverages as character personalities.",
      "Partner with existing beverage brands (Kopi Kenangan) to unlock co-owned storytelling beats.",
    ],
  },
  {
    id: "outputs",
    label: "Deliverables",
    title: "Multi-format product set",
    description:
      "All three outputs must stay in lockstep so our QA dashboard mirrors the deck.",
    highlights: [
      {
        title: "Limited packaging",
        bullets: [
          "Personalized cups and sleeves adapt Kawung + Mega Mendung patterns for on-the-go visibility.",
        ],
      },
      {
        title: "3D figurines",
        bullets: [
          "3D-printed collectibles with clean geometric bases to echo Kopi Kenangan's minimalism.",
          "Heart accessory nods to the brand logo; characters reference designer-toy hype (blind boxes, etc.).",
        ],
      },
      {
        title: "Kopi Kenangan × Batik LINE Stickers",
        bullets: [
          "Ka-Kun and Mega-Miu sticker sets tie the motifs into everyday chat language.",
          "Touch-projection kiosk concept lets guests scan a QR code to claim the packs instantly.",
        ],
      },
    ],
  },
];
