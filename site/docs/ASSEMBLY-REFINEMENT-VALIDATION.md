# Assembly resource refinement — 15 October 2026

Implemented locally after the previous release; these changes are not deployed yet.

- Universal, Food and Peace prayers use collective we/our/us wording. Shared references use our country, with natural plurals for minds, mouths, hearts and homes. God/You wording and the remaining prayer text are preserved.
- First Bell and highlighted prayer lines/words use static metallic gold text gradients, with plain ink fallback for printing. Selected assembly tabs, prayer choices, anthem meaning buttons and recording covers use the existing vibrant logo-petal gradient tokens. Orange and gold selections use dark text for readability.
- Rukun Negara retains its Malay introduction and all five principles in their original order. It now uses one continuous anthem-style reading block, without numbered badges/cards; English meanings appear only when selected. Small gradient markers carry the five petal colours.

Verification: all 50 tests passed; production build passed (public 148.1 KiB gzip / 150 KiB, authenticated core 192.4 / 200 KiB). Browser checked all three collective prayers, gold headline gradient, vibrant selected background and dark orange selection text. Rukun Negara contains one article with five principles and zero numbered card containers; English meaning toggle shows five translations. No console errors. A 482-pixel local view had no horizontal document overflow. Isolated production-preview screenshots are in `assembly-refinement-evidence/collective-morning.png` and `assembly-refinement-evidence/rukun-flow.png`.
