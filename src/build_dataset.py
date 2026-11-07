import json
import os
import re


def clean_and_filter_words(input_path, output_path):
  if not os.path.exists(input_path):
    print(f"⚠️ Анхаар: '{input_path}' файл олдсонгүй! Шинээр үүсгэнэ үү.")
    return

  with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

  cleaned_words = set()

  bad_suffixes = ('тай','тэй','той','туй','түй','төй','гүй','гуй','гэй','гай','гой','гөй','ийн','ын','аас','өөс','оос','үүс', 'лаг','лэг','лог','лөг','үүл')

  for line in lines:
    word = line.strip().lower()
    #if ' ' in word:
      #continue
    if len(word) < 2 or len(word) > 20:
      continue
    if not re.match(r'^[а-яөүё]+$', word):
      continue
    if word.endswith(bad_suffixes):
      continue

    cleaned_words.add(word)

  with open(output_path, 'w', encoding='utf-8') as f:
    for w in sorted(cleaned_words):
      f.write(w + '\n')

  print(
      f'Нийт {len(lines)} үгээс шүүгдэж, {len(cleaned_words)} цэвэр үндсэн үг'
      f' үлдлээ.'
  )

clean_and_filter_words('all_words.txt', 'clean_words.txt')
try:
  from sklearn.metrics.pairwise import cosine_similarity
  from sentence_transformers import SentenceTransformer
except ImportError:
  print('Шаардлагатай сан суулгаж байна... Түр хүлээнэ үү.')
  os.system('pip install sentence-transformers scikit-learn')
  from sklearn.metrics.pairwise import cosine_similarity
  from sentence_transformers import SentenceTransformer

print('Загварыг ачаалж байна...')
model = SentenceTransformer(
    'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
)
if os.path.exists('clean_words.txt'):
  with open('clean_words.txt', 'r', encoding='utf-8') as f:
    DICTIONARY = [line.strip() for line in f.readlines() if line.strip()]
else:
  print("⚠️ Анхаар: 'clean_words.txt' файл олдсонгүй!")
  DICTIONARY = []

if len(DICTIONARY) == 0:
  print(
      '❌ Алдаа: Үгийн сан хоосон байна! all_words.txt файлаа шалгана уу.'
  )
  exit()

import random
TARGET_WORDS = (
    random.sample(DICTIONARY, min(10, len(DICTIONARY)))
    if len(DICTIONARY) >= 10
    else DICTIONARY
)
print(
    f'Нийт {len(DICTIONARY)} үгтэй сангаас {len(TARGET_WORDS)} нууц үгийг'
    ' боловсруулж байна...'
)
word_embeddings = model.encode(DICTIONARY)

dataset = []

for target in TARGET_WORDS:
  if target not in DICTIONARY:
    print(f"⚠️ Анхаар: '{target}' үг үндсэн санд олдсонгүй!")
    continue

  target_idx = DICTIONARY.index(target)
  target_vector = word_embeddings[target_idx]

  scores_dict = {}

  for i, word in enumerate(DICTIONARY):
    sim = cosine_similarity([target_vector], [word_embeddings[i]])[0][0]
    percentage = int(max(0, min(100, (sim - 0.1) / 0.6 * 100)))
    if percentage > 10 or word == target:
      scores_dict[word] = percentage
  scores_dict[target] = 100

  dataset.append({'word': target, 'scores': scores_dict})
  print(f"✅ '{target}' үгийн оноо амжилттай бодогдлоо.")

output_path = 'words.json'
with open(output_path, 'w', encoding='utf-8') as f:
  json.dump(dataset, f, ensure_ascii=False, indent=2)

print(
    f"\n🎉 Амжилттай! '{output_path}' файл үүслээ. Одоо React төслөөсөө шууд"
    ' дуудаад ашиглаарай.'
)