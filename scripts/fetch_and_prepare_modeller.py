import urllib.request
import ssl
import re
import os
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

pages_config = [
    {
        'key': 'yatak-odasi',
        'url': 'https://atolyelocus.com/colombini/yatak-odasi',
        'dir': 'public/media/modeller/yatak-odasi',
        'web_prefix': '/media/modeller/yatak-odasi',
        'title': 'Yatak Odası Modelleri',
        'category_name': 'Yatak Odası',
        'code_prefix': 'YM-YTK',
        'series_desc': {
            'Golf': 'Golf Serisi; İtalyan modüler giyinme odası felsefesi, akıllı köşe gardırop çözümleri ve füme cam kapak entegrasyonu sunar.',
            'Volo': 'Volo Serisi; minimal hatlar, geometrik zarafet ve fonksiyonel gece masaları ile modern yatak odası anlayışını baştan tanımlar.',
            'Arcadia': 'Arcadia Serisi; klasik nostaljiyi sararmaz lake işçiliği ve romantik detaylarla harmanlayarak zamansız bir dinginlik sağlar.'
        }
    },
    {
        'key': 'salon',
        'url': 'https://atolyelocus.com/colombini/salon',
        'dir': 'public/media/modeller/salon',
        'web_prefix': '/media/modeller/salon',
        'title': 'Salon & Yaşam Alanı Modelleri',
        'category_name': 'Salon & Yaşam Alanı',
        'code_prefix': 'YM-SLN',
        'series_desc': {
            'Golf': 'Golf Serisi; geniş salonlar ve açık yaşam alanları için modüler kütüphane, TV arka paneli ve vitrin çözümleri sağlar.',
            'Volo': 'Volo Serisi; yüzen asma konsollar, entegre LED lineer aydınlatmalar ve gizli kablo tünelleriyle minimalist yaşam alanları kurar.',
            'Arcadia': 'Arcadia Serisi; klasik taç ve çıta detaylı TV üniteleri, lake büfeler ve sıcak ahşap tonlarıyla soylu bir salon ambiyansı oluşturur.'
        }
    },
    {
        'key': 'genc-odasi',
        'url': 'https://atolyelocus.com/colombini/genc-odasi',
        'dir': 'public/media/modeller/genc-odasi',
        'web_prefix': '/media/modeller/genc-odasi',
        'title': 'Genç Odası Modelleri',
        'category_name': 'Genç Odası',
        'code_prefix': 'YM-GNC',
        'series_desc': {
            'Golf': 'Golf Genç Serisi; ders çalışma, kitap depolama ve dinlenme fonksiyonlarını akıllı modüler düzenle gençlerin enerjisine uyarlar.',
            'Volo': 'Volo Genç Serisi; ergonomik çalışma masaları, manyetik panolar ve kompakt gardıroplarla modern genç odası tasarımı sunar.',
            'Arcadia': 'Arcadia Genç Serisi; zamansız çizgiler, sıcak pastel renkler ve sağlam masif detaylarla uzun ömürlü genç odaları üretir.'
        }
    },
    {
        'key': 'cocuk-odasi',
        'url': 'https://atolyelocus.com/colombini/cocuk-odasi',
        'dir': 'public/media/modeller/cocuk-odasi',
        'web_prefix': '/media/modeller/cocuk-odasi',
        'title': 'Çocuk Odası Modelleri',
        'category_name': 'Çocuk Odası',
        'code_prefix': 'YM-CK',
        'series_desc': {
            'Golf': 'Golf Çocuk Serisi; çocukların hayal gücünü geliştiren, oyun ve öğrenme alanlarını birleştiren modüler güvenli mobilyalar.',
            'Volo': 'Volo Çocuk Serisi; yuvarlatılmış çarpmaya karşı güvenli kenarlar, anti-alerjik lake yüzeyler ve geniş oyuncak sandıkları içerir.'
        }
    },
    {
        'key': 'camasir-odasi',
        'url': 'https://atolyelocus.com/colombini/camasir',
        'dir': 'public/media/modeller/camasir-odasi',
        'web_prefix': '/media/modeller/camasir-odasi',
        'title': 'Çamaşır Odası & Kiler Çözümleri',
        'category_name': 'Çamaşır Odası',
        'code_prefix': 'YM-CMR',
        'series_desc': {
            'Genel': 'Terzi Usulü Çamaşır İstasyonları; çamaşır ve kurutma makinelerini gizleyen marin gövdeli, teleskopik kirli sepetli özel imalat dolaplar.'
        }
    }
]

exclude_patterns = [
    'BKoPH9pmhpmqsKus8perz1KBDQ',
    'tlx8yW9TmCZrbGq4WUDs4WMQaA4',
    '6tTbkXggWgQCAJ4DO2QEdXXmgM',
    '11KSGbIZoRSg4pjdnUoif6MKHI',
    'sQyjSyfBtw0VYKRPPBefcwKWEeE',
    'spngdgMEwBObdL3mk8orRMKFkc'
]

title_adjectives = [
    'İtalyan Lake Kapaklı', 'Füme Cam ve Alüminyum Çerçeveli', 'Doğal Meşe Kaplamalı',
    'Mat Antrasit ve Ahşap Uyumlu', 'Gizli LED Aydınlatmalı', 'Entegre Modüler Sistemli',
    'Kişiye Özel Ölçü Terzi Usulü', 'Sessiz Blum Mekanizmalı', 'Bronz Reflekte Aynalı',
    'Modern Rustik Detaylı', 'Geniş İç Hacimli ve Çekmeceli', 'Akordeon ve Sürgü Sistemli',
    'Minimalist Çizgili İpek Mat', 'Masif Ağaç Dokulu Lüks', 'Fonksiyonel Köşe Tasarımlı'
]

title_nouns = {
    'yatak-odasi': [
        'Gardırop ve Giyinme Takımı', 'Karyola ve Şifonyer Kompozisyonu', 'Açık Modül Walk-in Closet',
        'Yatak Başı ve Gece Masası Ünitesi', 'Boy Aynalı Sürgü Kapaklı Dolap', 'Sandıklı Baza ve Gardırop Grubu',
        'Köşe Gardırop ve Makyaj Masası', 'Gömme Dolap ve Akıllı Depolama Çözümü'
    ],
    'salon': [
        'TV ve Medya Duvar Ünitesi', 'Yüzen Konsol ve Kitaplık Grubu', 'Akustik Ahşap Çıtalı Duvar Sistemi',
        'Açık Raflı Modern Kütüphane', 'Şömine Efektli Yaşam Duvarı', 'Cam Kapaklı Büfe ve Vitrin Ünitesi',
        'Geniş Depolamalı Salon Konsolu', 'Asimetrik Tasarımlı TV Sehpası'
    ],
    'genc-odasi': [
        'Entegre Masalı Çalışma İstasyonu', 'Ranzalı ve Merdiven Depolamalı Takım', 'Ergonomik Karyola ve Gardırop',
        'Kitaplıklı Genç Yaşam Köşesi', 'Kompakt Çalışma ve Dinlenme Alanı', 'Gizli Yataklı Çok Amaçlı Genç Dolabı',
        'Köşe Gardıroplu Genç Odası', 'Manyetik Panolu ve Raflı Çalışma Alanı'
    ],
    'cocuk-odasi': [
        'Montessori Uyumlu Karyola ve Dolap', 'Yuvarlatılmış Kenarlı Güvenli Çocuk Takımı', 'Eğlenceli Oyun ve Depolama Ünitesi',
        'Çekmeceli Oyuncak Sandıklı Çocuk Odası', 'Pastel Renkli İki Kardeş Odası', 'Büyüyebilen Karyolalı Çocuk Mobilyası',
        'Aktivite Masalı ve Raflı Kreş Takımı', 'Korumalı Ahşap Ranza ve Kıyafet Dolabı'
    ],
    'camasir-odasi': [
        'Çift Makineli Marin Çamaşır Kulesi', 'Gizli Ütü Masalı ve Sepetli Boy Dolap', 'Teleskopik Raylı Kirli Çamaşır İstasyonu',
        'Deterjan ve Temizlik Malzemesi Kileri', 'Porselen Evyeli Çamaşır ve Temizlik Tezgahı', 'Dar Koridor ve Banyo Çamaşır Dolabı',
        'Tavana Kadar Depolamalı Akıllı Hizmet Ünitesi', 'Kurutma ve Havalandırma Çözümlü Boy Dolabı', 'Kombine Ev İçi Kiler ve Çamaşır Sistemi'
    ]
}

specs_pool = [
    '18mm E1 Marin Neme Dayanıklı MDF Gövde • Blum Tandem Frenli Çekmece • 10 Yıl Garanti',
    'Sararmaz İtalyan Fırın Lake Kapaklar • Entegre Dokunmatik LED Aydınlatma • Özel İmalat',
    'Doğal Ahşap Kaplama Yüzey • Hettich Sessiz Yavaşlatıcı Menteşe • Lazerli Milimetrik Ölçü',
    'Füme Temperli Cam & Alüminyum Profil • Özel Bölmeli İç Düzenleyiciler • Terzi Usulü Buca Atölyesi',
    'Çizilmeye Mukavim Akrilik Yüzey • Gizli Kablo ve Tesisat Geçişleri • Ücretsiz 3D Mimari Çizim'
]

def download_file(args):
    img_url, local_path = args
    if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
        return True
    for attempt in range(4):
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=30) as res:
                content = res.read()
                if len(content) > 1000:
                    with open(local_path, 'wb') as f:
                        f.write(content)
                    return True
        except Exception:
            time.sleep(0.5)
    return False

all_data = {
    'yatak-odasi': [],
    'salon': [],
    'genc-odasi': [],
    'cocuk-odasi': [],
    'camasir-odasi': []
}

download_tasks = []

for pcfg in pages_config:
    pkey = pcfg['key']
    purl = pcfg['url']
    pdir = pcfg['dir']
    os.makedirs(pdir, exist_ok=True)
    
    print(f'Fetching {purl}...')
    req = urllib.request.Request(purl, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=20) as res:
        html = res.read().decode('utf-8', errors='ignore')
    
    sections = re.split(r'(Golf|Volo|Arcadia|Diğer Koleksiyonlar)', html)
    sec_data = {}
    current_sec = 'Genel' if pkey == 'camasir-odasi' else 'Golf'
    
    for part in sections:
        if part in ['Golf', 'Volo', 'Arcadia', 'Diğer Koleksiyonlar']:
            current_sec = part
            if current_sec not in sec_data:
                sec_data[current_sec] = []
        else:
            imgs = re.findall(r'https://framerusercontent\.com/images/([a-zA-Z0-9_-]+\.(?:webp|jpg|jpeg|png))', part)
            for img in imgs:
                if not any(exc in img for exc in exclude_patterns):
                    if current_sec not in sec_data:
                        sec_data[current_sec] = []
                    if img not in sec_data[current_sec]:
                        sec_data[current_sec].append(img)
                        
    if 'Diğer Koleksiyonlar' in sec_data:
        del sec_data['Diğer Koleksiyonlar']
        
    model_counter = 1
    for sec_name, img_list in sec_data.items():
        for img_fn in img_list:
            img_url = f'https://framerusercontent.com/images/{img_fn}'
            ext = os.path.splitext(img_fn)[1]
            local_fn = f'{pcfg["code_prefix"].lower()}-{model_counter:03d}{ext}'
            local_path = os.path.join(pdir, local_fn)
            web_path = f'{pcfg["web_prefix"]}/{local_fn}'
            
            download_tasks.append((img_url, local_path))
            
            adj = title_adjectives[(model_counter * 7 + 3) % len(title_adjectives)]
            nouns_list = title_nouns[pkey]
            noun = nouns_list[(model_counter * 5 + 2) % len(nouns_list)]
            spec = specs_pool[model_counter % len(specs_pool)]
            
            model_code = f'{pcfg["code_prefix"]}-{model_counter:03d}'
            full_title = f'{sec_name} Serisi {adj} {noun} ({model_code})'
            
            sec_story = pcfg['series_desc'].get(sec_name, 'Özel mimari projelendirme ve atölye zanaatı ile üretilen estetik ve fonksiyonel mobilya sistemi.')
            description = (
                f'Yeşilay Mutfak {pcfg["title"]} koleksiyonuna ait {model_code} kodlu özel imalat mobilya tasarımı. '
                f'{sec_story} '
                f'İzmir Buca Adatepe atölyemizde mekânınızın tam ölçüsüne ve kullanım alışkanlıklarınıza göre milimetrik olarak imal edilir. '
                f'{spec}. Çevre dostu E1 normlarında neme ve darbeye mukavim gövde yapısı, sararmaz yüzey kaplamaları ve '
                f'uzun ömürlü Alman/Avusturya menteşe-ray mekanizmaları ile 10 yıl atölye güvencemiz altındadır.'
            )
            
            item_entry = {
                'id': model_counter,
                'modelCode': model_code,
                'title': full_title,
                'category': pcfg['category_name'],
                'categorySlug': pkey,
                'series': sec_name,
                'image': web_path,
                'sourceFramerId': img_fn,
                'specs': spec,
                'description': description,
                'features': [
                    'Özel Ölçü Milimetrik İmalat',
                    'E1 Neme Dayanıklı Gövde',
                    'Blum / Hettich Sessiz Fren Mekanizması',
                    '10 Yıl Bütünleşik Atölye Garantisi',
                    'Ücretsiz Yerinde Lazer Keşif ve 3D Çizim'
                ]
            }
            all_data[pkey].append(item_entry)
            model_counter += 1

print(f'Starting concurrent download of {len(download_tasks)} images...')
with ThreadPoolExecutor(max_workers=16) as executor:
    futures = [executor.submit(download_file, task) for task in download_tasks]
    done_count = sum(1 for f in as_completed(futures) if f.result())

print(f'Successfully downloaded/verified {done_count}/{len(download_tasks)} images.')

for k, v in all_data.items():
    print(f'Category {k}: {len(v)} models')

with open('src/data/modellerData.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print('Saved to src/data/modellerData.json successfully.')
