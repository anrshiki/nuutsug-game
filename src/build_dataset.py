import json
import os

# 1. Шаардлагатай сангууд суулгагдсан эсэхийг шалгах
try:
    from sklearn.metrics.pairwise import cosine_similarity
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("Шаардлагатай сан суулгаж байна... Түр хүлээнэ үү.")
    os.system("pip install sentence-transformers scikit-learn")
    from sklearn.metrics.pairwise import cosine_similarity
    from sentence_transformers import SentenceTransformer

print("Загварыг ачаалж байна...")
# Олон хэл дээр ажилладаг утга зүйн загвар
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

# 2. Таны тоглоомд ашиглах боломжтой нийт үгсийн сан (Үүнийг та өргөжүүлж болно)
DICTIONARY = [
    "агт", "адуу", "морь", "даага", "шүдлэн", "хязаалан", "соёолон", "жороо", "үрээ",
    "тооно", "унь", "хана", "багана", "өрх", "дээвэр", "туурга", "тулга", "тэвш", 
    "ховоо", "цараа", "эмээл", "дөрөө", "ташуур", "хазаар", "ногт", "аргамж", 
    "жалга", "сайр", "булаг", "гол", "мөрөн", "нуур", "далай", "цөл", "говь", 
    "дахар", "зуд", "жавар", "цас", "мөс", "бороо", "үүл", "салхи", "агаар", 
    "гэр", "байшин", "хот", "аймаг", "сум", "аргал", "түлээ", "гал", "утаа"
]

# 3. TARGET_WORDS-оо тухайн үгийн сан дотроосоо автоматаар сонгох логик
# (Та хүсвэл эндээс сонгогдох нууц үгсээ өөрөө өөрчилж болно)
TARGET_WORDS = ["агт", "тооно", "тэвш", "эмээл", "жалга", "дахар", "ховоо"]

print(f"Нийт {len(DICTIONARY)} үгтэй сангаас {len(TARGET_WORDS)} нууц үгийг боловсруулж байна...")

# Бүх үгсийг вектор болгох
word_embeddings = model.encode(DICTIONARY)

dataset = []

for target in TARGET_WORDS:
    if target not in DICTIONARY:
        print(f"⚠️ Анхаар: '{target}' үг үндсэн санд олдсонгүй!")
        continue
        
    target_idx = DICTIONARY.index(target)
    target_vector = word_embeddings[target_idx]
    
    scores_dict = {}
    
    # Үг бүрийн утгын зайг хооронд нь харьцуулж хувиар бодох
    for i, word in enumerate(DICTIONARY):
        sim = cosine_similarity([target_vector], [word_embeddings[i]])[0][0]
        
        # Косинус утгыг 0%-100% хувийн шкаф руу шилжүүлэх
        percentage = int(max(0, min(100, (sim - 0.1) / 0.6 * 100)))
        
        # Дөхөж буй үгсийг хадгалах
        if percentage > 10 or word == target:
            scores_dict[word] = percentage
            
    # Нууц үг өөрөө 100% байх ёстой
    scores_dict[target] = 100
    
    dataset.append({
        "word": target,
        "scores": scores_dict
    })
    print(f"✅ '{target}' үгийн оноо амжилттай бодогдлоо.")

# 4. JSON файл болгон хадгалах (React төслийнхөө src/data/ хавтсанд шууд хадгалж болно)
output_path = "words.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Амжилттай! '{output_path}' файл үүслээ. Одоо React төслөөсөө шууд дуудаад ашиглаарай.")