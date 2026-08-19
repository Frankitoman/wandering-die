import base64
import os
import time
from openai import OpenAI

KEY_PATH = os.path.join(os.path.dirname(__file__), '.openai_key')
with open(KEY_PATH, 'r') as f:
    api_key = f.read().strip()

client = OpenAI(api_key=api_key)

OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'classes')
os.makedirs(OUT_DIR, exist_ok=True)

STYLE = (
    "Dark fantasy digital painting, dramatic cinematic lighting, painterly brushwork "
    "in the style of premium RPG concept art. Cold silver highlights against deep "
    "violet and purple shadows, atmospheric fog and light particles, epic and moody "
    "mood. No text, no logos, no watermarks, no UI elements, no borders."
)

CLASSES = [
    ("barbarian", "A towering barbarian warrior mid-roar, gripping a massive greataxe, muscles tensed, standing on a storm-lit battlefield, torn furs and tribal tattoos, wind whipping around them"),
    ("bard", "A charismatic bard mid-performance in a torch-lit tavern, playing a glowing lute, an enchanted melody visible as swirling light around them, an entranced crowd in shadow behind"),
    ("cleric", "A devoted cleric kneeling in prayer before a radiant holy symbol, divine silver-violet light pouring down through a cathedral ceiling, dust motes floating in the beams"),
    ("druid", "A druid mid-transformation, half-shifted into a great wolf, standing in an ancient moonlit forest with glowing runes on gnarled roots"),
    ("fighter", "A battle-scarred fighter in ornate plate armor standing resolute on a war-torn battlefield at dusk, sword planted in the ground, torn banners smoldering in the distance"),
    ("monk", "A monk in a mid-motion martial stance atop a misty mountain monastery courtyard, glowing ki energy swirling around their fists, serene expression"),
    ("paladin", "A radiant paladin in gleaming silver armor holding a glowing sword aloft before a shattered altar, violet holy light radiating outward like a shield"),
    ("ranger", "A hooded ranger crouched at the edge of an ancient forest, longbow drawn, a loyal wolf companion beside them, moonlight filtering through violet-tinted fog"),
    ("rogue", "A cloaked rogue perched on a rooftop above a rain-slicked medieval city at night, twin daggers glinting, a violet magical glow rising from a nearby alley"),
    ("sorcerer", "A sorcerer with arcane energy crackling wildly from outstretched hands, eyes glowing violet, standing in the eye of a swirling magical storm"),
    ("warlock", "A warlock striking a pact beneath a massive spectral eye in the sky, tendrils of shadowy violet energy coiling around their raised arm, an ominous unearthly glow"),
    ("wizard", "An elderly wizard in flowing silver-trimmed robes studying a floating glowing spellbook in a candlelit tower study filled with arcane artifacts"),
]

LOG_PATH = os.path.join(os.path.dirname(__file__), 'gen_log.txt')

def already_done(class_id):
    return os.path.exists(os.path.join(OUT_DIR, class_id + '.jpg'))

with open(LOG_PATH, 'a') as log:
    for class_id, subject in CLASSES:
        if already_done(class_id):
            print('skip', class_id)
            continue
        prompt = STYLE + " Subject: " + subject
        raw_path = os.path.join(OUT_DIR, class_id + '_raw.png')
        for attempt in range(3):
            try:
                result = client.images.generate(
                    model="gpt-image-1",
                    prompt=prompt,
                    size="1536x1024",
                    quality="medium",
                    n=1,
                )
                b64 = result.data[0].b64_json
                with open(raw_path, 'wb') as f:
                    f.write(base64.b64decode(b64))
                print('ok', class_id)
                log.write('ok ' + class_id + '\n')
                log.flush()
                break
            except Exception as e:
                print('error', class_id, attempt, e)
                time.sleep(3)
        else:
            log.write('FAIL ' + class_id + '\n')
            log.flush()

print('done')
