/* =================================================================
   GOLGEDEKI KASA - game.js
   Bolum 1: Olay Yeri Kesfi | Bolum 2: Supheliler
================================================================= */
const Game = (() => {

  // ── STATE ──────────────────────────────────────────────────
  let state = {
    currentScene: null,
    currentChapter: 1,
    clues: [],
    inventory: [],
    visitedScenes: new Set(),
    flags: {},
    notebookTab: 'clues',
    suspects: {
      isabella: { questionsAsked: [], alibiChallenged: false, resistance: 3 },
      marcus:   { questionsAsked: [], alibiChallenged: false, resistance: 3 },
      blackwood:{ questionsAsked: [], alibiChallenged: false, resistance: 3 }
    }
  };

  // ── SUSPECTS ──────────────────────────────────────────────
  const SUSPECTS = {
    isabella: {
      id: 'isabella',
      name: 'Isabella Reed',
      title: 'Cirak / Asistan - 26 yasinda',
      emoji: 'I',
      badgeClass: 'badge-a',
      speakerClass: 'suspect-a',
      alibi: 'Atolyenin ust katinda restorasyon yapiyordum. Muzik dinliyordum, hicbir sey duymadim.',
      motivation: 'Ozgurlugun kazanmak; sureklii maruz kaldigi psikolojik siddetten kurtulmak.',
      secret: 'Kasadaki santaj dosyalarindan birinde kendi adi da geciyor.',
      evidenceItem: 'torn-diary',
      confession: 'Isabella titriyor. "Tamam. O defteri ben yaktim. Icinde Eliasın bana ne yaptirdigi yaziyordu... Ama onu ben oldurmedim. Ant iciyorum. Sadece kurtulmak istiyordum."',
      questions: [
        {
          id: 'isa-q1',
          text: 'O gece ne yapiyordunuz?',
          answer: 'Ust katta calisiyordum. Bazen saatlerce orada kalirim, Elias beni rahatsiz etmezdi. Ya da... edemezdi artik.',
          clue: null,
          flag: 'asked_isa_night'
        },
        {
          id: 'isa-q2',
          text: 'Elias sizi nasil biri olarak tanimlardu?',
          answer: 'Alet olarak. Ben onu kapti mi kurtaracak bir aractim. On yildir. Duraksiyoor. Ozur dilerim. Bu cok sert oldu.',
          clue: null,
          flag: 'asked_isa_relation'
        },
        {
          id: 'isa-q3',
          text: 'Kasada ozel belgeler tutuldugunu biliyor muydunuz?',
          answer: 'Gozleri kisiliyor. Kasayi hic actirdigini gormedim. Ama sesler duyuyordum bazen. Kagit sesi... ve sifreler.',
          clue: 'clue-isa-knows-safe',
          flag: 'asked_isa_safe'
        },
        {
          id: 'isa-q4',
          text: 'Santaj yapilan kisiler arasinda siz de var miydiniz?',
          answer: 'Derin bir sessizlik. Bu soruyu yanitlamak zorunda degilim. Ama eli titredi.',
          clue: 'clue-isa-in-files',
          flag: 'asked_isa_blackmail',
          requiresFlag: 'asked_isa_safe'
        },
        {
          id: 'isa-q5',
          text: 'Kimyasal malzemelerle calisir misiniz?',
          answer: 'Restorasyon icin evet. Ama zehir mi? Hayir. Ben birini oldirmek icin bu kadar karmasik bir yontem secmezdim. Mola veriyor. Yani... boyle bir sey yapmam.',
          clue: null,
          flag: 'asked_isa_chem'
        }
      ]
    },

    marcus: {
      id: 'marcus',
      name: 'Marcus Vance',
      title: 'Koleksiyoner / Is Adami - 45 yasinda',
      emoji: 'M',
      badgeClass: 'badge-b',
      speakerClass: 'suspect-b',
      alibi: 'Karsi sokaktaki Kizil Aslan barinda tek basima iciyordum. Barmen beni gordu.',
      motivation: 'Itibarini kurtarmak ve santaj kasetini yok etmek.',
      secret: 'Barmene rusvet verdi. Aslinda dukkanin arka tarafindaydi.',
      evidenceItem: 'barman-note',
      confession: 'Marcus ayaga kalkiyor. "Tamam! O gece dukkanin onundeyidm. Sadece dosyami geri almak istedim. Ama kasa kilitliydi, iceri giremedim. Ant iciyorum, Elias o zaman coktan olmus olmali!"',
      questions: [
        {
          id: 'mar-q1',
          text: 'O gece neredeydiniz?',
          answer: 'Kizil Aslandaydim. Barmen Tomas beni gordu. Butun gece oradaydim. Gozleri sizi degil duvardaki noktayi inceliyor.',
          clue: null,
          flag: 'asked_mar_night'
        },
        {
          id: 'mar-q2',
          text: 'Elias Thorne ile ticari iliskinizi anlatir misiniz?',
          answer: 'Antika alirim ondan. Siradan bir is iliskisi. Duraksiyoor. Alisildik olmayan parcalar.',
          clue: 'clue-mar-business',
          flag: 'asked_mar_business'
        },
        {
          id: 'mar-q3',
          text: 'Sizi tehdit ediyor muydu?',
          answer: 'Ne? Sesi yuksekligi surcuyor. Sonra kontrol kazaniyor. Hayir. Bu ne demek?',
          clue: null,
          flag: 'asked_mar_threat',
          requiresFlag: 'asked_mar_business'
        },
        {
          id: 'mar-q4',
          text: 'Barmen Tomas ile konustum - sizi o gece gordu mu?',
          answer: 'Yuzu kasiliyor. Uzun bir sessizlik. Tomas bazen hata yapar. Ses tonu artik savunmaci.',
          clue: 'clue-mar-alibi-crack',
          flag: 'asked_mar_alibi_challenge',
          requiresFlag: 'found_barman_note'
        },
        {
          id: 'mar-q5',
          text: 'Dukkanin arka kapisinda arac izi bulduk.',
          answer: 'O mahallede pek cok arac var. Ama parmaklarini sikistiriyor. Avukatimi aramam gerekiyor.',
          clue: 'clue-mar-backdoor',
          flag: 'asked_mar_car',
          requiresFlag: 'asked_mar_alibi_challenge'
        }
      ]
    },

    blackwood: {
      id: 'blackwood',
      name: 'Dr. Aris Blackwood',
      title: 'Kimyager / Eski Ortak - 52 yasinda',
      emoji: 'B',
      badgeClass: 'badge-c',
      speakerClass: 'suspect-c',
      alibi: 'Sehir disindaki laboratuvarimda ydim.',
      motivation: 'Intikam ve Eliasn caldigi gizli kimyasal formul kitabini geri almak.',
      secret: 'Cinayette kullanilan norotoksinin ve buz kapsulu mekanizmasinin yaraticisi o.',
      evidenceItem: 'empty-bottle',
      confession: 'Blackwood uzun sure susuyor. Sonra: "O sise benim formulumden yapildi. Evet. Ben hazirladim. Ama... formul kitabim calinmisti. Belki baska birisi kullandı." Eli titriyor.',
      questions: [
        {
          id: 'bw-q1',
          text: 'O gece neredeydiniz?',
          answer: 'Laboratuvarimdaydim. Sabaha kadar calisiyordum. Ellerini masanin altinda tutuyor.',
          clue: null,
          flag: 'asked_bw_night'
        },
        {
          id: 'bw-q2',
          text: 'Elias Thorneu taniyor muydunuz?',
          answer: 'Eski ortak. Kisa ve keskin. Birlikte calistik. Sonra o... ayrildi. Gulumseme yok.',
          clue: 'clue-bw-relation',
          flag: 'asked_bw_relation'
        },
        {
          id: 'bw-q3',
          text: 'Norotoksin sentezleyebilir misiniz?',
          answer: 'Gozler kisiliyor. Teorik olarak evet. Ama bu bir suclamami? Soguk, profesyonel.',
          clue: 'clue-bw-toxin',
          flag: 'asked_bw_toxin',
          requiresFlag: 'asked_bw_relation'
        },
        {
          id: 'bw-q4',
          text: 'Otopark kameralari aracinizin o gece sehirde oldugunu gosteriyor.',
          answer: 'Ilk kez duraksiyoor. Kameralar yaniyor. Uzun bir duraklama. Ya da... kisa bir is icin sehire dondum. Onemli degil.',
          clue: 'clue-bw-camera',
          flag: 'asked_bw_camera',
          requiresFlag: 'found_camera_footage'
        },
        {
          id: 'bw-q5',
          text: 'Formul kitabiniz calindi mi?',
          answer: 'Kim size bunu soyledi? Ses tonu ilk kez gergin. O kitap benim emegimdiy. Elias onu aldi ve... evet. Calindi.',
          clue: 'clue-bw-formula',
          flag: 'asked_bw_formula',
          requiresFlag: 'asked_bw_toxin'
        }
      ]
    }
  };

  // ── SCENES ────────────────────────────────────────────────
  const SCENES = {
    'entrance': {
      id: 'entrance', chapter: 1, name: 'Dukkan Girisi',
      description: 'Elias Thornenin "THORNE ANTIKA & RESTORASYON" levhali dukkaninin onundesiniz. Sari polis seritleri giris kapisini cevreliyor. Bir yagmur ciseliyor; kaldirimdaki isiklar asfalti altin sarisiyla yansitivor.',
      dialog: 'Gece yarisi, kapali bir oda cinayeti. Iceride beni ne bekliyor?',
      hotspots: [
        { id: 'hs-door',   label: 'Kapi',            x: 38, y: 28, w: 12, h: 35, action: 'look_door' },
        { id: 'hs-sign',   label: 'Tabela',           x: 16, y: 12, w: 20, h: 12, action: 'look_sign' },
        { id: 'hs-window', label: 'Vitrin Penceresi', x: 58, y: 22, w: 22, h: 28, action: 'look_window' },
        { id: 'hs-trash',  label: 'Cop Kutusu',       x: 82, y: 55, w: 10, h: 22, action: 'look_trash' }
      ],
      actions: [
        { id: 'enter-shop',  label: '>> Iceri gir (Ana Showroom)', next: 'showroom' },
        { id: 'call-report', label: '>> Polis tutanagini incele',   action: 'read_report' },
        { id: 'look-around', label: '>> Cevreye genel bak',         action: 'look_around_entrance' }
      ]
    },

    'showroom': {
      id: 'showroom', chapter: 1, name: 'Ana Showroom',
      description: 'Toz kokan, los aydinlatmali genis bir oda. Her kosede cam vitrinler icinde antikalar dizili. Zemine serpilmis antika parcalari ve devrilmis bir cam vitrin dikkat cekiyor. Arkada inen merdivenler bodrum kata ulasiyoor.',
      dialog: 'Burasi karistirilmis. Biri aceleyle bir seyler ariyordu.',
      hotspots: [
        { id: 'hs-vitrin', label: 'Devrilmis Vitrin',    x: 12, y: 38, w: 22, h: 30, action: 'look_vitrin' },
        { id: 'hs-desk',   label: 'Restorasyon Tezgahi', x: 58, y: 30, w: 20, h: 28, action: 'look_desk' },
        { id: 'hs-clock',  label: 'Eski Duvar Saati',    x: 82, y: 10, w: 10, h: 30, action: 'look_clock' },
        { id: 'hs-stairs', label: 'Bodrum Merdiveni',    x: 42, y: 52, w: 16, h: 28, action: 'go_basement_hint' }
      ],
      actions: [
        { id: 'go-basement', label: 'v Bodrum kata in',             next: 'basement' },
        { id: 'go-entrance', label: '<< Geri don (Dukkan Girisi)',  next: 'entrance' },
        { id: 'look-ledger', label: '>> Muhasebe defterini incele', action: 'look_ledger' }
      ]
    },

    'basement': {
      id: 'basement', chapter: 1, name: 'Bodrum - Kasa Odasi',
      description: 'Nemli, soguk bir bodrum. Devasa celik kasa kapisi zorlanarak acilmis; menteseler bukulmus. Kasanin icinde kurban Elias Thorne, zemine yigilmis halde. Zeminde ZAMAN yazisi kanla cizilmis. Tavanda kucuk bir havalandirma izgarasi var.',
      dialog: '"ZAMAN." Olurken ne soylemek istedi? Katili mi ima ediyor, yoksa bir ipucu mu?',
      hotspots: [
        { id: 'hs-safe-door', label: 'Kasa Kapisi',           x: 25, y: 18, w: 22, h: 55, action: 'look_safe_door' },
        { id: 'hs-body',      label: 'Eliasın Cesedi',        x: 52, y: 42, w: 18, h: 28, action: 'look_body' },
        { id: 'hs-writing',   label: 'ZAMAN Yazisi',          x: 50, y: 72, w: 20, h: 12, action: 'look_writing' },
        { id: 'hs-vent',      label: 'Havalandirma Izgarasi', x: 78, y:  8, w: 12, h: 10, action: 'look_vent' },
        { id: 'hs-hidden',    label: 'Gizli Bolme',           x:  8, y: 55, w: 10, h: 20, action: 'look_hidden',
          hidden: true, requiredFlag: 'found_compartment_hint' }
      ],
      actions: [
        { id: 'go-showroom',    label: '<< Geri don (Showroom)',         next: 'showroom' },
        { id: 'examine-inside', label: '>> Kasa icini incele',           action: 'examine_safe_inside' },
        { id: 'check-lock',     label: '>> Kilit mekanizmasini incele',  action: 'check_lock' },
        { id: 'advance-ch2',    label: '-> Suphelilere gec (Bolum 2)',   action: 'advance_to_chapter2',
          requiresClues: ['clue-vent', 'clue-body', 'clue-writing', 'clue-examine'] }
      ]
    },

    'suspects-hub': {
      id: 'suspects-hub', chapter: 2, name: 'Sorgu Merkezi',
      description: 'Cinayet gece 22:00-23:30 arasinda gerceklesti. Uc supheli var; her birinin alibisi, motivasyonu ve sakadigi bir sir mevcut. Kim yalan soyluyor?',
      dialog: 'Suphelileri sorgula, alibi celiskilerini ortaya cikar. Yeterli kanit toplayinca katili ifsa et.',
      hotspots: [
        { id: 'hs-isa', label: 'Isabella Reed', x: 10, y: 20, w: 22, h: 50, action: 'interrogate_isabella' },
        { id: 'hs-mar', label: 'Marcus Vance',  x: 40, y: 20, w: 22, h: 50, action: 'interrogate_marcus' },
        { id: 'hs-bw',  label: 'Dr. Blackwood', x: 70, y: 20, w: 22, h: 50, action: 'interrogate_blackwood' }
      ],
      actions: [
        { id: 'int-isa',      label: '[I] Isabella Reedi sorgula',  action: 'interrogate_isabella',  suspectBtn: 'a' },
        { id: 'int-mar',      label: '[M] Marcus Vancei sorgula',   action: 'interrogate_marcus',    suspectBtn: 'b' },
        { id: 'int-bw',       label: '[B] Dr. Blackwoodu sorgula',  action: 'interrogate_blackwood', suspectBtn: 'c' },
        { id: 'goto-bar',     label: '>> Kizil Aslan Barina git',   next: 'red_lion_bar' },
        { id: 'goto-atelier', label: '>> Atolye Ust Katina git',    next: 'atelier_upper' },
        { id: 'final-accuse', label: '!! Katili Ifsa Et',           action: 'open_final_accusation',
          requiresClues: ['clue-isa-in-files', 'clue-mar-alibi-crack', 'clue-bw-camera', 'clue-bw-formula'] }
      ]
    },

    'red_lion_bar': {
      id: 'red_lion_bar', chapter: 2, name: 'Kizil Aslan Bari',
      description: 'Karsi sokaktaki los bar. Marcusun alibi taniki barmen Tomas burada calisiyor. Barda sari bir DEVAMSIZ notu asili; Tomas dun gece yokmus. Rusvet parasinin zarf izi masada duruyor.',
      dialog: 'Marcus "tum gece buradaydim" dedi. Ama Tomas dun gece burada degilmis.',
      hotspots: [
        { id: 'hs-barman', label: 'Barmen Notu',        x: 30, y: 15, w: 25, h: 30, action: 'look_barman_note' },
        { id: 'hs-zarf',   label: 'Para Zarfi',         x: 62, y: 45, w: 18, h: 20, action: 'look_envelope' },
        { id: 'hs-tablet', label: 'Rezervasyon Defteri',x: 14, y: 50, w: 14, h: 25, action: 'look_reservation' }
      ],
      actions: [
        { id: 'back-hub',        label: '<< Sorgu Merkezine don',    next: 'suspects-hub' },
        { id: 'talk-bartender',  label: '>> Yedek Barmen ile Konus', action: 'talk_backup_barman' }
      ]
    },

    'atelier_upper': {
      id: 'atelier_upper', chapter: 2, name: 'Atolye - Ust Kat',
      description: 'Isabellain calisma alani. Yarim kalmis restorasyon isleri, boyalar, kimyasal cozuculer. Bir kulaklik masada duruyor. Ama dikkat ceken sey: pencereden bodrum kat havalandirma deligi gorunuyor.',
      dialog: '"Hicbir sey duymadim" dedi. Peki buradan ne kadar gorebilirdi?',
      hotspots: [
        { id: 'hs-headphone', label: 'Kulaklik',         x: 55, y: 38, w: 16, h: 18, action: 'look_headphone' },
        { id: 'hs-window-at', label: 'Atolye Penceresi', x: 10, y: 15, w: 22, h: 35, action: 'look_atelier_window' },
        { id: 'hs-workbench', label: 'Calisma Tezgahi',  x: 65, y: 30, w: 22, h: 35, action: 'look_workbench' },
        { id: 'hs-diary',     label: 'Gizli Gunluk',     x: 38, y: 62, w: 16, h: 18, action: 'look_diary',
          hidden: true, requiredFlag: 'found_diary_hint' }
      ],
      actions: [
        { id: 'back-hub',       label: '<< Sorgu Merkezine don', next: 'suspects-hub' },
        { id: 'search-drawers', label: '>> Cekmeceleri ara',     action: 'search_drawers' }
      ]
    }
  };

  // ── CLUES ─────────────────────────────────────────────────
  const CLUES = {
    'clue-report':         { title: 'Polis Tutanagi',        body: 'Olay: Gece 02:14te alarm sistemi devreye girmis. Ilk ekip 02:31de geldiginde kasa iceriden surgluyduu. Eliasın uzerinde panzehir kutusu (bos) bulundu.' },
    'clue-sign':           { title: 'Dukkan Tabelasi',       body: '"THORNE ANTIKA & RESTORASYON - 1987den beri." Alt levhada: "Ozel Siparisler - Randevuyla." Ne tur ozel siparisler?' },
    'clue-window':         { title: 'Vitrin Cami',           body: 'Vitrin caminda taze bir cizik var - disaridan. Cam kirilmamis. Birisi bir seyi iceri surmeye calismis olabilir.' },
    'clue-vitrin':         { title: 'Devrilmis Vitrin',      body: 'Cam kirilmamis; vitrin iceriden devrilmis gibi. Panikle kacan biri mi devirdi?' },
    'clue-desk':           { title: 'Restorasyon Tezgahi',   body: 'Tezgahta etiketli sise: "Cozucu R-7 - Sogukta kati kalir, 28C uzerinde sivilasir." Sise yarim dolu.' },
    'clue-clock':          { title: 'Duvar Saati',           body: 'Yay kurmali saat 02:14te durmus. Alarm zamaniyla birebir ortusuyoor. Kasitli durdurulmus olabilir.' },
    'clue-ledger':         { title: 'Muhasebe Defteri',      body: 'Son sayfada sifreli notlar. Tekrarlayan harf: "Z." Son not: "Z. - Teslim onaylandi." Zaman mi, bir kisi adi mi?' },
    'clue-safe-door':      { title: 'Kasa Kapisi',           body: 'Baricle zorlanarak acilmis. Iceriden surge acik olsa da kapi acilamamis. Mentese vidalarinda beyaz toz izi.' },
    'clue-body':           { title: 'Eliasın Cesedi',        body: 'Gogus bolgesinde kasilma - norotoksin belirtisi. Uzerinde bos panzehir kutusu; hic kullananamis.' },
    'clue-writing':        { title: 'ZAMAN Yazisi',          body: '"ZAMAN." Kanin pihtilasmaa derecesine gore olumden 3-4 dakika once yazilmis. Panikle degil, bilinclii.' },
    'clue-vent':           { title: 'Havalandirma Izgarasi', body: 'Vidalarin cevresinde balmumu izi. Izgaranin arkasinda isiyla eriyerek sekiilsiz hale gelmis metal kapsul kalintisi.' },
    'clue-hidden':         { title: 'Gizli Bolme',           body: 'Kasa ic duvaarinda gizli cekmece. Icinde panzehiri anlatan el yazisiyla not ve bos cam sise. Panzehir calinmisti.' },
    'clue-examine':        { title: 'Kasa Ic Yuzeyi',        body: 'Havalandirma delginin yanından yayilan sarimsii leke. Tavan kosesinde nem izleri - buharlasan sivinin kalintisi.' },
    'clue-lock':           { title: 'Kilit Mekanizmasi',     body: 'Kilitte kaba kuvvet izi yok. Surge iceriden kilitlenmis. Elias kendisi girdi - panzehirin icerde oldugunu sandi.' },
    'clue-isa-knows-safe': { title: 'Isabella: Kasa Farkindamligi', body: 'Isabella kasadan ses duyudgunu kabul etti. Sifrelerin de farkindaymis. Kasanin iceindekilerden haberi olabilir.' },
    'clue-isa-in-files':   { title: 'Isabella: Dosyalarda Adi Var', body: 'Soruyu yanitlamaktan kacindi ama eli titredi. Santaj dosyalarindan birinde kendi adi geciyor olabilir. Guclu bir motiv.' },
    'clue-mar-business':   { title: 'Marcus: Is Iliskisi',          body: '"Alisildik olmayan parcalar" dedi. Eliasın satislari yasal antika ticaretinin cok otesine geciyordu.' },
    'clue-mar-alibi-crack':{ title: 'Marcus: Alibi Cokuyor',        body: 'Barmen Tomasın o gece orada olmadigi ortaya cikinca Marcus savunmaci bir tutuma gecti. Alibi rusvetle uydurulmus.' },
    'clue-mar-backdoor':   { title: 'Marcus: Arka Kapi',            body: 'Arac izi sorusu karsisinda hemen avukat istedi. Dukkanin arka kapisinda izler saptandi.' },
    'clue-bw-relation':    { title: 'Blackwood: Eski Ortak',        body: 'Elias ile ortakliktan "ayrildigini" soyledi. Yuz ifadesi ofkeyii gizleyemedi. Intikam motifi acik.' },
    'clue-bw-toxin':       { title: 'Blackwood: Toksin Bilgisi',    body: '"Teorik olarak evet" dedi. Norotoksin sentezi icin gerekli bilgiye sahip. Bu cinayeti planlayabilecek tek kisi.' },
    'clue-bw-camera':      { title: 'Blackwood: Sehirde Yakalandi', body: 'Otopark kamerasiyla celisince "kisa bir is icin dondum" dedi. Alibi coktu. Cinayetin gecesi sehirdeydi.' },
    'clue-bw-formula':     { title: 'Blackwood: Calınan Formul',    body: 'Formul kitabinin Elias tarafindan calindigini itiraf etti. Kitabi geri almak icin kasayi hedef almis olabilir.' },
    'clue-barman-absent':  { title: 'Barmen Tomas: Izinli',         body: '"DEVAMSIZ" notu dogruluyor: Tomas dun gece izinliydi. Marcusun alibi taniki o gece barda degildi.' },
    'clue-envelope':       { title: 'Para Zarfi',                   body: 'Masadaki zarf icinde birkacc banknot kalintisi. Zarf uzerinde "T." notu var. Marcus, Tomasaa rusvet verdi.' },
    'clue-reservation':    { title: 'Rezervasyon Defteri',          body: 'O gece defterde Marcus Vance adina kayit yok. Ama ertesi sabah eklenen bir not var; el yazisi farkli.' },
    'clue-headphone':      { title: 'Kulaklik',                     body: 'Kulaklik tamamen islevsel. Maksimum ses seviyesinde bodrum katindan hicbir sey duyulmaz. Isabella dogru soylemiis olabilir.' },
    'clue-atelier-window': { title: 'Atolye Penceresi',             body: 'Pencereden bodrum kat havalandirma deligi gorunuyor. Disaridan bir kapsul yerlestirmek icin bu pencere ideal bir gozlem noktasi.' },
    'clue-workbench':      { title: 'Atolye Tezgahi',               body: 'Tezgahta buz kaliiplari icin kullanilabilecek kucuk metal kafes izleri var. Isabella restorasyon disinda baska seyler yapmis olabilir.' },
    'clue-diary':          { title: 'Isabellain Gunlugu',           body: 'Gunlugun son sayfasi yirtilmis. Onceki sayfada: "Artik dayanamiyoruum. Bir cikis yolu bulmam lazim." Tarih: olaydan uc gun once.' },
    'clue-backup-barman':  { title: 'Yedek Barmen Ifadesi',         body: 'Yedek barmen: "Marcus Vancei tanirim. O gece burada degildi. Zaten Tomas da izinliydi - ikimiz de yoktuk." Alibi tamamen coktu.' }
  };


  // ── ACTIONS ───────────────────────────────────────────────
  const ACTIONS = {

    // BOLUM 1
    look_door: () => { dialog('Kapi', 'Kapi zorla acilmamis. Normal kilidiyle acilmis. Birisi anahtara sahipti ya da kilit ustaca cozuldu.'); },
    look_sign: () => { addClue('clue-sign'); dialog('Tabela', CLUES['clue-sign'].body); },
    look_window: () => { addClue('clue-window'); dialog('Vitrin Cami', CLUES['clue-window'].body); },
    look_trash: () => { dialog('Cop Kutusu', 'Sokak cop kutusu. Icinde bozulmus kahve bardaklari ve gazete. Dukkanla ilgisi yok gibi gorunuyor.'); },
    read_report: () => { addClue('clue-report'); dialog('Polis Tutanagi', CLUES['clue-report'].body); },
    look_around_entrance: () => { dialog('Dedektif', 'Yagmur artiyor. Dukkanin cevresinde baska bir giris yok - arka kapi demir levhayla kapatilmis ve paslanmis... ya da oyle gorunuyor.'); },
    look_vitrin: () => { addClue('clue-vitrin'); dialog('Devrilmis Vitrin', CLUES['clue-vitrin'].body); },
    look_desk: () => { addClue('clue-desk'); dialog('Restorasyon Tezgahi', CLUES['clue-desk'].body); },
    look_clock: () => { addClue('clue-clock'); dialog('Duvar Saati', CLUES['clue-clock'].body); },
    go_basement_hint: () => { dialog('Dedektif', 'Merdivenler bodrum kata iniyor. Asagidan kuflenmiis metal ve yanik bir koku geliyor.'); },
    look_ledger: () => { addClue('clue-ledger'); dialog('Muhasebe Defteri', CLUES['clue-ledger'].body); },
    look_safe_door: () => { addClue('clue-safe-door'); dialog('Kasa Kapisi', CLUES['clue-safe-door'].body); },
    look_body: () => { addClue('clue-body'); dialog('Eliasın Cesedi', CLUES['clue-body'].body); },
    look_writing: () => { addClue('clue-writing'); dialog('ZAMAN Yazisi', CLUES['clue-writing'].body); },

    look_vent: () => {
      addClue('clue-vent');
      setFlag('found_vent');
      setFlag('found_camera_footage');
      dialog('Havalandirma Izgarasi', CLUES['clue-vent'].body);
      refreshHotspots();
    },

    look_hidden: () => {
      addClue('clue-hidden');
      addItem({ id: 'empty-bottle', label: 'Bos Sise', detail: 'Temizlenmiis bir cam sise. Ama ic duvarlarda kimyasal izi kalmis - norotoksine ait olabilir. Blackwoodun formulu ile eslesebilir.' });
      dialog('Gizli Bolme', CLUES['clue-hidden'].body);
    },

    examine_safe_inside: () => {
      addClue('clue-examine');
      setFlag('found_compartment_hint');
      dialog('Kasa Ici', CLUES['clue-examine'].body + ' Duvarlara daha yakindan bakmaliyim...');
      refreshHotspots();
    },

    check_lock: () => { addClue('clue-lock'); dialog('Kilit Mekanizmasi', CLUES['clue-lock'].body); },

    advance_to_chapter2: () => {
      var ok = state.clues.includes('clue-vent') && state.clues.includes('clue-body') &&
               state.clues.includes('clue-writing') && state.clues.includes('clue-examine');
      if (!ok) { dialog('Dedektif', 'Henuz yeterli kanit yok. Kasayi daha dikkatli incelemeliydim.'); return; }
      showChapterTransition(2, 'BOLUM 2: SUPHELILER',
        'Mekanizmayi anladiniz - ama kim kurdu bu tuzagi? Cinayet gece 22:00-23:30 arasinda gerceklesti. Uc supheli ifadeye cagrildi. Her birinin bir alibisi, bir motivasyonu ve sakadigi bir sir var. Dikkat: Her sorgulama 2 saat alir!',
        function() { loadChapter2(); });
    },

    // BOLUM 2
    interrogate_isabella:  () => { openInterrogation('isabella'); },
    interrogate_marcus:    () => { openInterrogation('marcus'); },
    interrogate_blackwood: () => { openInterrogation('blackwood'); },

    look_barman_note: () => {
      addClue('clue-barman-absent');
      setFlag('found_barman_note');
      addItem({ id: 'barman-note', label: 'Barmen Notu', detail: 'Barda asili DEVAMSIZ notu: Tomas dun gece izin almis. Notun altinda yonetici imzasi ve tarih var. Bu, Marcusun tek alibi tanikinin o gece barda olmadigini kanitliyor.' });
      dialog('Barmen Notu', CLUES['clue-barman-absent'].body);
      refreshHotspots();
      renderActions(SCENES[state.currentScene]);
    },

    look_envelope: () => { addClue('clue-envelope'); dialog('Para Zarfi', CLUES['clue-envelope'].body); },
    look_reservation: () => { addClue('clue-reservation'); dialog('Rezervasyon Defteri', CLUES['clue-reservation'].body); },

    talk_backup_barman: () => {
      addClue('clue-backup-barman');
      dialog('Yedek Barmen', CLUES['clue-backup-barman'].body);
    },

    look_headphone: () => { addClue('clue-headphone'); dialog('Kulaklik', CLUES['clue-headphone'].body); },

    look_atelier_window: () => {
      addClue('clue-atelier-window');
      setFlag('found_diary_hint');
      dialog('Atolye Penceresi', CLUES['clue-atelier-window'].body + ' Ve odada bir seylerin gizlendgine dair belirsiz bir his var...');
      refreshHotspots();
    },

    look_workbench: () => { addClue('clue-workbench'); dialog('Calisma Tezgahi', CLUES['clue-workbench'].body); },

    look_diary: () => {
      addClue('clue-diary');
      addItem({ id: 'torn-diary', label: 'Yirtik Gunluk', detail: 'Gunlugun son sayfasi yirtilmis. Onceki sayfada: "Artik dayanamiyorum. Bir cikis yolu bulmam lazim." Tarih: olaydan uc gun once. Yirtilan sayfada ne yaziyordu?' });
      dialog('Gizli Gunluk', CLUES['clue-diary'].body);
    },

    search_drawers: () => {
      if (!state.flags['found_diary_hint']) {
        dialog('Dedektif', 'Cekmeceler kilitli ya da daginik. Daha dikkatli bakmaliyim.');
        return;
      }
      dialog('Dedektif', 'Cekmeecenin altina yapismis, kucuk bir gunluk. Sayfalarin bir kismi yirtilmis...');
      setFlag('found_diary_hint_2');
      refreshHotspots();
      renderActions(SCENES[state.currentScene]);
    },

    open_final_accusation: () => {
      var req = ['clue-isa-in-files','clue-mar-alibi-crack','clue-bw-camera','clue-bw-formula'];
      if (!req.every(function(c){ return state.clues.includes(c); })) {
        dialog('Dedektif', 'Henuz tum ipuclarina ulasmadim. Suphelileri daha dikkatli sorgulamaliyim.');
        return;
      }
      showFinalDecisionScreen();
    }
  };

  // ── INTERROGATION ─────────────────────────────────────────
  function openInterrogation(suspectId) {
    var suspect = SUSPECTS[suspectId];
    if (!suspect) return;
    state.flags['current_suspect'] = suspectId;

    var overlay = document.getElementById('interrogation-overlay');
    overlay.classList.remove('hidden');

    var badge = document.getElementById('suspect-badge');
    badge.className = 'suspect-badge ' + suspect.badgeClass;
    badge.textContent = suspect.emoji;
    document.getElementById('suspect-name').textContent = suspect.name;
    document.getElementById('suspect-title').textContent = suspect.title;

    var speakerEl = document.getElementById('interr-speaker');
    speakerEl.className = 'interr-speaker player';
    speakerEl.textContent = 'Dedektif';
    typeText('interr-text', suspect.name + ' ile gorusme basliyor. Ne sormak istersiniz?');

    updateSuspectStatus(suspectId);
    renderInterrogationQuestions(suspectId);
  }

  function renderInterrogationQuestions(suspectId) {
    var suspect = SUSPECTS[suspectId];
    var sState = state.suspects[suspectId];
    var container = document.getElementById('interrogation-questions');
    container.innerHTML = '';

    // Direnc bari
    var barHtml = '<div class="resistance-bar-wrap">';
    barHtml += '<span class="resistance-label">Psikolojik Direnc:</span>';
    barHtml += '<div class="resistance-bar">';
    for (var ri = 0; ri < 3; ri++) {
      barHtml += '<div class="resistance-segment' + (ri < sState.resistance ? ' active' : '') + '"></div>';
    }
    barHtml += '</div>';
    if (sState.resistance === 0) barHtml += '<span class="resistance-broken">KIRILI</span>';
    barHtml += '</div>';
    container.insertAdjacentHTML('beforeend', barHtml);

    function sectionTitle(txt) {
      var el = document.createElement('div');
      el.className = 'q-section-title';
      el.textContent = txt;
      container.appendChild(el);
    }

    sectionTitle('SORULAR');

    suspect.questions.forEach(function(q) {
      if (q.requiresFlag && !state.flags[q.requiresFlag]) return;
      var asked = sState.questionsAsked.includes(q.id);

      var btn = document.createElement('button');
      btn.className = 'btn-action' + (asked ? ' question-answered' : '');
      btn.textContent = (asked ? 'v ' : '') + q.text;
      btn.addEventListener('click', function() {
        askQuestion(suspectId, q);
        renderInterrogationQuestions(suspectId);
        renderActions(SCENES[state.currentScene]);
      });
      container.appendChild(btn);
    });

    // Envanter delili sunma
    sectionTitle('DELIL SUN');
    var hasEvidenceItem = state.inventory.find(function(i){ return i.id === suspect.evidenceItem; });
    var evidenceBtn = document.createElement('button');
    if (hasEvidenceItem && sState.resistance > 0) {
      evidenceBtn.className = 'btn-action highlight pulse';
      evidenceBtn.textContent = 'Delil Goster: "' + hasEvidenceItem.label + '"';
      evidenceBtn.addEventListener('click', function() {
        presentEvidence(suspectId);
        renderInterrogationQuestions(suspectId);
        renderActions(SCENES[state.currentScene]);
      });
    } else if (sState.resistance === 0) {
      evidenceBtn.className = 'btn-action question-answered';
      evidenceBtn.textContent = 'v Direnc kiridi - Itiraf alindi';
      evidenceBtn.disabled = true;
    } else {
      evidenceBtn.className = 'btn-action';
      evidenceBtn.textContent = 'Delil yok - Once sahaya don';
      evidenceBtn.disabled = true;
    }
    container.appendChild(evidenceBtn);

    sectionTitle('ALIBI');
    var alibiBtn = document.createElement('button');
    alibiBtn.className = 'btn-action';
    alibiBtn.textContent = 'Alibi: "' + suspect.alibi.substring(0, 55) + '..."';
    alibiBtn.addEventListener('click', function() { challengeAlibi(suspectId); });
    container.appendChild(alibiBtn);

    sectionTitle('');
    var closeBtn = document.createElement('button');
    closeBtn.className = 'btn-action';
    closeBtn.textContent = '<< Gorusmeyi Bitir';
    closeBtn.addEventListener('click', function() { Game.closeInterrogation(); });
    container.appendChild(closeBtn);
  }

  function askQuestion(suspectId, q) {
    var suspect = SUSPECTS[suspectId];
    var sState = state.suspects[suspectId];
    if (!sState.questionsAsked.includes(q.id)) {
      sState.questionsAsked.push(q.id);
    }

    var speakerEl = document.getElementById('interr-speaker');
    speakerEl.className = 'interr-speaker player';
    speakerEl.textContent = 'Dedektif';
    typeText('interr-text', q.text + '\n\n' + suspect.name + ': ' + q.answer);

    if (q.clue && CLUES[q.clue]) addClue(q.clue);
    if (q.flag) setFlag(q.flag);

    updateSuspectStatus(suspectId);

    var speakerEl2 = document.getElementById('interr-speaker');
    speakerEl2.className = 'interr-speaker ' + suspect.speakerClass;
    speakerEl2.textContent = suspect.name;
  }

  function presentEvidence(suspectId) {
    var suspect = SUSPECTS[suspectId];
    var sState = state.suspects[suspectId];

    if (sState.resistance <= 0) return;

    // Direnci kirilt
    sState.resistance = 0;
    setFlag('confession_' + suspectId);

    var speakerEl = document.getElementById('interr-speaker');
    speakerEl.className = 'interr-speaker ' + suspect.speakerClass;
    speakerEl.textContent = suspect.name;

    typeText('interr-text', 'Dedektif masaya delili koyuyor...\n\n' + suspect.confession);

    // Ilgili ipucunu da ekle
    if (suspectId === 'marcus') addClue('clue-mar-alibi-crack');
    if (suspectId === 'blackwood') { addClue('clue-bw-camera'); addClue('clue-bw-formula'); }
    if (suspectId === 'isabella') addClue('clue-isa-in-files');

    updateSuspectStatus(suspectId);
  }

  function challengeAlibi(suspectId) {
    var suspect = SUSPECTS[suspectId];
    var sState = state.suspects[suspectId];
    var speakerEl = document.getElementById('interr-speaker');
    speakerEl.className = 'interr-speaker ' + suspect.speakerClass;
    speakerEl.textContent = suspect.name;

    if (suspectId === 'marcus' && state.clues.includes('clue-barman-absent')) {
      sState.alibiChallenged = true;
      setFlag('marcus_alibi_broken');
      typeText('interr-text', 'Dedektif: "Barmen Tomas o gece izinliydi. Kimse sizi orada gormedi."\n\nMarcus: (Yuzu kasiliyor) "Bu... bir hata olmali. Ben oradaydim." Ama bakislari kaciyor.');
    } else if (suspectId === 'blackwood' && state.clues.includes('clue-bw-camera')) {
      sState.alibiChallenged = true;
      setFlag('blackwood_alibi_broken');
      typeText('interr-text', 'Dedektif: "Otopark kameralari sehirde oldugunuzu kanitliyor."\n\nBlackwood: (Uzun sessizlik) "Tamam. Sehire dondum. Ama kimseyi oldurmedim."');
    } else if (suspectId === 'isabella') {
      typeText('interr-text', 'Dedektif: "Ust kattaydiniz. Bodrum kattan ses geldiginde hic duymadin mi?"\n\nIsabella: "Muzik actik. Her zaman acik olurdu... Eliasi rahatsiz etmemek icin." Sesi kiriliyor.');
    } else {
      typeText('interr-text', 'Dedektif: "Alibinizi dogrulayacak baska biri var mi?"\n\nSupheli savunmaci bir tutum sergiliyor.');
    }
    updateSuspectStatus(suspectId);
  }

  function updateSuspectStatus(suspectId) {
    var suspect = SUSPECTS[suspectId];
    var sState = state.suspects[suspectId];
    var el = document.getElementById('suspect-status-text');
    var asked = sState.questionsAsked.length;
    var total = suspect.questions.length;
    var status = 'Sorular: ' + asked + '/' + total;
    if (sState.resistance === 0) status += ' | ITIRAF ALINDI';
    else if (suspectId === 'marcus' && state.flags['marcus_alibi_broken']) status += ' | ALIBI COKTU';
    else if (suspectId === 'blackwood' && state.flags['blackwood_alibi_broken']) status += ' | ALIBI COKTU';
    else if (sState.alibiChallenged) status += ' | Alibi Sorgulandı';
    el.textContent = status;
  }

  // ── CHAPTER TRANSITION ────────────────────────────────────
  var _chapterCallback = null;

  function showChapterTransition(num, title, text, callback) {
    _chapterCallback = callback;
    var overlay = document.getElementById('chapter-transition');
    overlay.classList.remove('hidden');
    document.getElementById('ct-stamp').textContent = 'BOLUM ' + num;
    document.getElementById('ct-title').textContent = title;
    document.getElementById('ct-text').textContent = text;
  }

  function loadChapter2() {
    state.currentChapter = 2;
    document.getElementById('chapter-label').textContent = 'BOLUM 2';
    loadScene('suspects-hub');
  }

  // ── SCENE RENDERER (Canvas) ───────────────────────────────
  var SceneRenderer = {
    canvas: null,
    ctx: null,

    init: function() {
      this.canvas = document.getElementById('scene-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      var self = this;
      window.addEventListener('resize', function() { self.resize(); });
    },

    resize: function() {
      var container = this.canvas.parentElement;
      this.canvas.width  = container.clientWidth  || 640;
      this.canvas.height = container.clientHeight || 400;
      if (state.currentScene) this.draw(state.currentScene);
    },

    draw: function(sceneId) {
      var c = this.ctx, W = this.canvas.width, H = this.canvas.height;
      c.clearRect(0, 0, W, H);
      if (sceneId === 'entrance')      this.drawEntrance(c, W, H);
      else if (sceneId === 'showroom') this.drawShowroom(c, W, H);
      else if (sceneId === 'basement') this.drawBasement(c, W, H);
      else if (sceneId === 'suspects-hub')  this.drawSuspectsHub(c, W, H);
      else if (sceneId === 'red_lion_bar')  this.drawBar(c, W, H);
      else if (sceneId === 'atelier_upper') this.drawAtelier(c, W, H);
      else this.drawDefault(c, W, H);
    },

    drawEntrance: function(c, W, H) {
      var sky = c.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, '#060810'); sky.addColorStop(1, '#121520');
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      var ground = c.createLinearGradient(0, H * 0.55, 0, H);
      ground.addColorStop(0, '#1a1a1c'); ground.addColorStop(1, '#0e0e10');
      c.fillStyle = ground; c.fillRect(0, H * 0.55, W, H);
      c.strokeStyle = 'rgba(180,200,230,0.15)'; c.lineWidth = 1;
      for (var i = 0; i < 55; i++) {
        var rx = ((Math.sin(i * 137.5) + 1) / 2) * W, ry = (i * 73) % H;
        c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 2, ry + 14); c.stroke();
      }
      c.fillStyle = '#1e1c18'; c.fillRect(W * 0.08, H * 0.06, W * 0.84, H * 0.52);
      c.strokeStyle = '#2a2820'; c.lineWidth = 3; c.strokeRect(W * 0.08, H * 0.06, W * 0.84, H * 0.52);
      var dX = W*0.36, dY = H*0.2, dW = W*0.14, dH = H*0.38;
      c.fillStyle = '#14120e'; c.fillRect(dX, dY, dW, dH);
      c.strokeStyle = '#3a3020'; c.lineWidth = 2; c.strokeRect(dX, dY, dW, dH);
      c.fillStyle = '#c8a84b'; c.beginPath(); c.arc(dX + dW*0.8, dY + dH*0.55, 4, 0, Math.PI*2); c.fill();
      var wX = W*0.56, wY = H*0.15, wW = W*0.24, wH = H*0.3;
      var wg = c.createLinearGradient(wX, wY, wX, wY+wH);
      wg.addColorStop(0, 'rgba(60,50,20,0.7)'); wg.addColorStop(1, 'rgba(20,15,5,0.9)');
      c.fillStyle = wg; c.fillRect(wX, wY, wW, wH);
      c.strokeStyle = '#4a3e20'; c.lineWidth = 2; c.strokeRect(wX, wY, wW, wH);
      c.fillStyle = '#2a2418'; c.fillRect(W*0.14, H*0.08, W*0.28, H*0.1);
      c.strokeStyle = '#c8a84b'; c.lineWidth = 1; c.strokeRect(W*0.14, H*0.08, W*0.28, H*0.1);
      c.fillStyle = '#c8a84b'; c.font = 'bold ' + Math.max(9, W*0.018) + 'px Georgia,serif';
      c.textAlign = 'center'; c.fillText('THORNE ANTIKA', W*0.28, H*0.115);
      c.font = Math.max(7, W*0.013) + 'px Courier New,monospace'; c.fillStyle = '#7a6428';
      c.fillText('& RESTORASYON', W*0.28, H*0.145);
      for (var j = 0; j < 5; j++) {
        c.fillStyle = (j % 2 === 0) ? '#f5d400' : '#1a1a1a';
        c.fillRect(W*0.1 + (W*0.8/4)*j, H*0.58, W*0.8/4, 8);
      }
      c.fillStyle = '#f5d400'; c.font = 'bold ' + Math.max(7, W*0.012) + 'px Courier New,monospace';
      c.fillText('POLIS SERIDI', W*0.5, H*0.575);
      c.fillStyle = '#1a1818'; c.fillRect(W*0.83, H*0.58, W*0.09, H*0.2);
      c.strokeStyle = '#333'; c.lineWidth = 1; c.strokeRect(W*0.83, H*0.58, W*0.09, H*0.2);
      c.textAlign = 'left';
    },

    drawShowroom: function(c, W, H) {
      var fl = c.createLinearGradient(0, H*0.5, 0, H);
      fl.addColorStop(0, '#18160e'); fl.addColorStop(1, '#0e0c08');
      c.fillStyle = fl; c.fillRect(0, H*0.5, W, H);
      var wl = c.createLinearGradient(0, 0, 0, H*0.5);
      wl.addColorStop(0, '#1c1a12'); wl.addColorStop(1, '#14120a');
      c.fillStyle = wl; c.fillRect(0, 0, W, H*0.5);
      c.strokeStyle = 'rgba(80,70,40,0.3)'; c.lineWidth = 1;
      for (var i = 0; i <= 8; i++) {
        c.beginPath(); c.moveTo(W*0.5, H*0.5); c.lineTo((W/8)*i, H); c.stroke();
      }
      c.fillStyle = '#1e1c14'; c.fillRect(W*0.05, H*0.2, W*0.25, H*0.45);
      c.strokeStyle = '#3a3020'; c.lineWidth = 2; c.strokeRect(W*0.05, H*0.2, W*0.25, H*0.45);
      c.strokeStyle = 'rgba(200,168,75,0.4)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(W*0.05, H*0.2); c.lineTo(W*0.3, H*0.65); c.stroke();
      c.fillStyle = '#c8a84b'; c.font = Math.max(8, W*0.013) + 'px Courier New,monospace';
      c.textAlign = 'center'; c.fillText('DEVRILMIS', W*0.175, H*0.7);
      c.fillStyle = '#1a1608'; c.fillRect(W*0.55, H*0.25, W*0.22, H*0.32);
      c.strokeStyle = '#3a3020'; c.lineWidth = 2; c.strokeRect(W*0.55, H*0.25, W*0.22, H*0.32);
      c.fillStyle = '#8a7840'; c.fillText('TEZGAH', W*0.66, H*0.42);
      c.strokeStyle = '#5a4820'; c.lineWidth = 3;
      c.beginPath(); c.arc(W*0.87, H*0.2, W*0.055, 0, Math.PI*2); c.stroke();
      c.fillStyle = '#c8a84b'; c.font = 'bold ' + Math.max(7, W*0.011) + 'px Courier New,monospace';
      c.fillText('02:14', W*0.87, H*0.21);
      c.fillStyle = '#100e08'; c.fillRect(W*0.42, H*0.55, W*0.16, H*0.35);
      c.strokeStyle = '#4a3e20'; c.lineWidth = 2; c.strokeRect(W*0.42, H*0.55, W*0.16, H*0.35);
      for (var k = 1; k <= 4; k++) {
        c.strokeStyle = '#2a2410'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(W*0.42, H*0.55 + (H*0.35/5)*k); c.lineTo(W*0.58, H*0.55 + (H*0.35/5)*k); c.stroke();
      }
      c.fillStyle = '#7a6428'; c.fillText('v BODRUM', W*0.5, H*0.63);
      c.textAlign = 'left';
    },

    drawBasement: function(c, W, H) {
      c.fillStyle = '#0a0a0c'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#1a1a1e'; c.lineWidth = 1;
      for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 6; col++) {
          c.strokeRect(col*(W/6) + (row%2===0?0:W/12), row*(H*0.12), W/6, H*0.12);
        }
      }
      c.fillStyle = '#121214'; c.fillRect(0, H*0.62, W, H*0.38);
      var sx = W*0.08, sy = H*0.12, sw = W*0.32, sh = H*0.65;
      var kg = c.createLinearGradient(sx, 0, sx+sw, 0);
      kg.addColorStop(0, '#1e2024'); kg.addColorStop(0.4, '#2a2e34'); kg.addColorStop(1, '#14161a');
      c.fillStyle = kg; c.fillRect(sx, sy, sw, sh);
      c.fillStyle = '#3a3e44';
      c.fillRect(sx-8, sy+sh*0.15-7, 18, 14);
      c.fillRect(sx-8, sy+sh*0.85-7, 18, 14);
      c.strokeStyle = '#c8a84b'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(sx-2, sy+sh*0.15-5); c.lineTo(sx+6, sy+sh*0.15+5); c.stroke();
      c.fillStyle = '#555a60'; c.fillRect(sx+sw-18, sy+sh*0.45, 24, 10);
      c.strokeStyle = '#c8a84b'; c.lineWidth = 1; c.strokeRect(sx+sw-18, sy+sh*0.45, 24, 10);
      c.strokeStyle = '#2a2e34'; c.lineWidth = 2; c.strokeRect(sx, sy, sw, sh);
      c.fillStyle = '#1c1410'; c.beginPath();
      c.ellipse(W*0.62, H*0.7, W*0.1, H*0.08, 0.3, 0, Math.PI*2); c.fill();
      c.fillStyle = '#241c14'; c.beginPath();
      c.ellipse(W*0.58, H*0.65, W*0.06, H*0.07, -0.2, 0, Math.PI*2); c.fill();
      c.fillStyle = 'rgba(140,20,20,0.85)';
      c.font = 'bold ' + Math.max(14, W*0.028) + 'px Georgia,serif';
      c.textAlign = 'center'; c.fillText('ZAMAN', W*0.62, H*0.85);
      var vx = W*0.78, vy = H*0.08, vs = W*0.12;
      c.fillStyle = '#18181c'; c.fillRect(vx, vy, vs, vs*0.6);
      c.strokeStyle = '#3a3a40'; c.lineWidth = 1;
      for (var vi = 1; vi <= 3; vi++) {
        c.beginPath(); c.moveTo(vx+(vs/4)*vi, vy); c.lineTo(vx+(vs/4)*vi, vy+vs*0.6); c.stroke();
      }
      c.strokeRect(vx, vy, vs, vs*0.6);
      if (state.clues.includes('clue-vent')) {
        var vg = c.createRadialGradient(vx+vs/2, vy+vs*0.3, 0, vx+vs/2, vy+vs*0.3, vs*0.4);
        vg.addColorStop(0, 'rgba(200,168,75,0.3)'); vg.addColorStop(1, 'transparent');
        c.fillStyle = vg; c.fillRect(vx-vs*0.2, vy-vs*0.2, vs*1.4, vs);
      }
      if (state.flags['found_compartment_hint']) {
        c.strokeStyle = 'rgba(168,212,168,0.45)'; c.lineWidth = 2; c.setLineDash([4,3]);
        c.strokeRect(sx+8, sy+sh*0.6, sw*0.22, sh*0.18); c.setLineDash([]);
        c.fillStyle = 'rgba(168,212,168,0.7)';
        c.font = Math.max(9, W*0.014) + 'px Courier New,monospace';
        c.fillText('?', sx+sw*0.11, sy+sh*0.71);
      }
      var lt = c.createRadialGradient(W*0.5, 0, 0, W*0.5, 0, H*0.8);
      lt.addColorStop(0, 'rgba(200,168,75,0.06)'); lt.addColorStop(1, 'transparent');
      c.fillStyle = lt; c.fillRect(0, 0, W, H);
      c.textAlign = 'left';
    },

    drawSuspectsHub: function(c, W, H) {
      c.fillStyle = '#0c0c10'; c.fillRect(0, 0, W, H);
      var lg = c.createRadialGradient(W*0.5, H*0.1, 0, W*0.5, H*0.5, H*0.8);
      lg.addColorStop(0, 'rgba(200,168,75,0.1)'); lg.addColorStop(1, 'transparent');
      c.fillStyle = lg; c.fillRect(0, 0, W, H);
      c.fillStyle = '#10101a'; c.fillRect(0, H*0.72, W, H*0.28);
      c.fillStyle = '#1a1610'; c.fillRect(W*0.25, H*0.55, W*0.5, H*0.2);
      c.strokeStyle = '#3a3020'; c.lineWidth = 2; c.strokeRect(W*0.25, H*0.55, W*0.5, H*0.2);
      var sdata = [
        { x: W*0.16, color: '#4b8bc8', name: 'ISABELLA', sid: 'isabella' },
        { x: W*0.5,  color: '#c8774b', name: 'MARCUS',   sid: 'marcus' },
        { x: W*0.83, color: '#8b4bc8', name: 'BLACKWOOD',sid: 'blackwood' }
      ];
      sdata.forEach(function(s) {
        var sg = c.createRadialGradient(s.x, H*0.38, 0, s.x, H*0.38, W*0.09);
        sg.addColorStop(0, s.color + '33'); sg.addColorStop(1, 'transparent');
        c.fillStyle = sg; c.fillRect(s.x - W*0.08, H*0.15, W*0.16, H*0.45);
        c.fillStyle = '#18161c';
        c.beginPath(); c.ellipse(s.x, H*0.5, W*0.05, H*0.18, 0, 0, Math.PI*2); c.fill();
        c.beginPath(); c.arc(s.x, H*0.28, W*0.035, 0, Math.PI*2); c.fill();
        c.strokeStyle = s.color + '80'; c.lineWidth = 2;
        c.beginPath(); c.arc(s.x, H*0.28, W*0.04, 0, Math.PI*2); c.stroke();
        c.fillStyle = s.color; c.textAlign = 'center';
        c.font = Math.max(7, W*0.012) + 'px Courier New,monospace';
        c.fillText(s.name, s.x, H*0.65);
        var nAsked = state.suspects[s.sid] ? state.suspects[s.sid].questionsAsked.length : 0;
        if (nAsked === 0) {
          c.fillStyle = 'rgba(200,168,75,0.5)';
          c.font = Math.max(12, W*0.02) + 'px Georgia,serif';
          c.fillText('?', s.x, H*0.22);
        } else {
          c.fillStyle = '#a8d4a8';
          c.font = Math.max(10, W*0.016) + 'px Georgia,serif';
          c.fillText('v', s.x, H*0.22);
        }
      });
      c.fillStyle = 'rgba(200,168,75,0.7)'; c.textAlign = 'center';
      c.font = Math.max(9, W*0.015) + 'px Courier New,monospace';
      c.fillText('CINAYET SAATI: 22:00 - 23:30', W*0.5, H*0.08);
      c.textAlign = 'left';
    },

    drawBar: function(c, W, H) {
      c.fillStyle = '#0e0a08'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#2a1a0a'; c.fillRect(0, H*0.55, W, H*0.45);
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0, H*0.55); c.lineTo(W, H*0.55); c.stroke();
      c.fillStyle = '#1a1008'; c.fillRect(0, H*0.05, W, H*0.38);
      var bcolors = ['#1a3a5acc','#5a1a1acc','#1a4a1acc','#4a3a1acc'];
      for (var bi = 0; bi < 9; bi++) {
        var bx = W*0.06 + bi*(W*0.1), bh = H*(0.1 + Math.sin(bi*2.1)*0.04);
        c.fillStyle = bcolors[bi%4]; c.fillRect(bx, H*0.18-bh, W*0.06, bh);
        c.strokeStyle = bcolors[bi%4].substring(0,7); c.lineWidth = 1;
        c.strokeRect(bx, H*0.18-bh, W*0.06, bh);
      }
      c.fillStyle = '#f5f0d8';
      c.save(); c.translate(W*0.42, H*0.28); c.rotate(0.05);
      c.fillRect(0, 0, W*0.22, H*0.14);
      c.fillStyle = '#c84b4b'; c.font = 'bold ' + Math.max(9, W*0.016) + 'px Georgia,serif';
      c.textAlign = 'center'; c.fillText('DEVAMSIZ', W*0.11, H*0.058);
      c.fillStyle = '#333'; c.font = Math.max(7, W*0.011) + 'px Courier New,monospace';
      c.fillText('Tomas - Izinli', W*0.11, H*0.09); c.restore();
      c.fillStyle = '#d4c080';
      c.save(); c.translate(W*0.7, H*0.58); c.rotate(-0.08);
      c.fillRect(0, 0, W*0.1, H*0.06);
      c.fillStyle = '#7a6028'; c.font = Math.max(7, W*0.011) + 'px Courier New,monospace';
      c.textAlign = 'center'; c.fillText('"T."', W*0.05, H*0.038); c.restore();
      c.fillStyle = '#1a2a1a'; c.fillRect(W*0.06, H*0.58, W*0.12, H*0.1);
      c.strokeStyle = '#2a4a2a'; c.lineWidth = 1; c.strokeRect(W*0.06, H*0.58, W*0.12, H*0.1);
      c.fillStyle = '#4a8a4a'; c.font = Math.max(6, W*0.01) + 'px Courier New,monospace';
      c.textAlign = 'center'; c.fillText('REZERV.', W*0.12, H*0.64);
      c.fillStyle = '#c84b4b'; c.font = 'bold ' + Math.max(12, W*0.022) + 'px Georgia,serif';
      c.fillText('KIZIL ASLAN', W*0.5, H*0.14);
      c.textAlign = 'left';
    },

    drawAtelier: function(c, W, H) {
      var bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1a1608'); bg.addColorStop(1, '#0e0c04');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      var wg = c.createLinearGradient(W*0.06, 0, W*0.3, 0);
      wg.addColorStop(0, 'rgba(200,180,100,0.5)'); wg.addColorStop(1, 'rgba(100,80,30,0.1)');
      c.fillStyle = wg; c.fillRect(W*0.06, H*0.1, W*0.22, H*0.45);
      c.strokeStyle = '#5a4a20'; c.lineWidth = 3; c.strokeRect(W*0.06, H*0.1, W*0.22, H*0.45);
      c.strokeStyle = '#3a2a10'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(W*0.17, H*0.1); c.lineTo(W*0.17, H*0.55); c.stroke();
      c.beginPath(); c.moveTo(W*0.06, H*0.325); c.lineTo(W*0.28, H*0.325); c.stroke();
      c.fillStyle = 'rgba(168,212,168,0.35)'; c.textAlign = 'center';
      c.font = Math.max(7, W*0.011) + 'px Courier New,monospace';
      c.fillText('HAVA.', W*0.17, H*0.42);
      c.fillStyle = '#2a2010'; c.fillRect(W*0.55, H*0.25, W*0.38, H*0.35);
      c.strokeStyle = '#4a3820'; c.lineWidth = 2; c.strokeRect(W*0.55, H*0.25, W*0.38, H*0.35);
      for (var ai = 0; ai < 4; ai++) {
        c.fillStyle = '#3a2818'; c.fillRect(W*0.57+ai*W*0.08, H*0.27, W*0.05, H*0.05);
      }
      c.strokeStyle = '#888'; c.lineWidth = 3;
      c.beginPath(); c.arc(W*0.63, H*0.5, W*0.035, Math.PI, 0); c.stroke();
      c.fillStyle = '#666';
      c.fillRect(W*0.595, H*0.5, W*0.01, H*0.04);
      c.fillRect(W*0.655, H*0.5, W*0.01, H*0.04);
      c.fillStyle = '#18160a'; c.fillRect(0, H*0.72, W, H*0.28);
      var pcolors = ['rgba(100,60,20,0.4)','rgba(60,80,100,0.4)','rgba(80,100,60,0.4)'];
      for (var pi = 0; pi < 3; pi++) {
        c.fillStyle = pcolors[pi];
        c.beginPath(); c.ellipse(W*(0.2+pi*0.25), H*0.83, W*0.04, H*0.02, 0, 0, Math.PI*2); c.fill();
      }
      if (state.flags['found_diary_hint']) {
        c.strokeStyle = 'rgba(168,212,168,0.5)'; c.lineWidth = 2; c.setLineDash([3,3]);
        c.strokeRect(W*0.36, H*0.6, W*0.14, H*0.12); c.setLineDash([]);
        c.fillStyle = '#1a2a1a'; c.fillRect(W*0.37, H*0.61, W*0.12, H*0.1);
        c.fillStyle = 'rgba(168,212,168,0.8)'; c.font = Math.max(7, W*0.011) + 'px Courier New,monospace';
        c.fillText('G.', W*0.43, H*0.67);
      }
      c.textAlign = 'left';
    },

    drawDefault: function(c, W, H) {
      c.fillStyle = '#0d0d0f'; c.fillRect(0, 0, W, H);
    }
  };


  // ── UI HELPERS ────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    var el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
  }

  function typeText(elId, text) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.textContent = '';
    var i = 0;
    if (el._ti) clearInterval(el._ti);
    el._ti = setInterval(function() {
      if (i < text.length) { el.textContent += text[i]; i++; }
      else clearInterval(el._ti);
    }, 13);
  }

  function dialog(speaker, text) {
    document.getElementById('dialog-speaker').textContent = speaker;
    typeText('dialog-text', text);
  }

  function setDescription(text) {
    document.getElementById('scene-description').textContent = text;
  }

  function setLocationLabel(name) {
    document.getElementById('location-label').textContent = '>> ' + name;
  }

  function addClue(id) {
    if (!CLUES[id]) return;
    if (state.clues.includes(id)) return;
    state.clues.push(id);
    updateClueCount();
    updateNotebook();
    flashClueNotice();
  }

  function updateClueCount() {
    document.getElementById('clue-count').textContent = '(' + state.clues.length + ')';
  }

  function updateNotebook() {
    renderNotebookTab(state.notebookTab);
  }

  function renderNotebookTab(tab) {
    state.notebookTab = tab;
    var el = document.getElementById('notebook-content');

    if (tab === 'clues') {
      if (state.clues.length === 0) {
        el.innerHTML = '<p class="notebook-empty">Henuz hicbir ipucu toplanmadi.</p>';
        return;
      }
      el.innerHTML = state.clues.map(function(id) {
        var clue = CLUES[id];
        if (!clue) return '';
        return '<div class="clue-entry"><div class="clue-title">?? ' + clue.title + '</div><div class="clue-body">' + clue.body + '</div></div>';
      }).join('');

    } else if (tab === 'suspects') {
      if (state.currentChapter < 2) {
        el.innerHTML = '<p class="notebook-empty">Supheliler Bolum 2de belirece.</p>';
        return;
      }
      el.innerHTML = Object.values(SUSPECTS).map(function(s) {
        var ss = state.suspects[s.id];
        var asked = ss.questionsAsked.length;
        var total = s.questions.length;
        var alibiTxt = '';
        if (s.id === 'marcus' && state.flags['marcus_alibi_broken']) alibiTxt = ' [ALIBI COKTU]';
        else if (s.id === 'blackwood' && state.flags['blackwood_alibi_broken']) alibiTxt = ' [ALIBI COKTU]';
        var sirHtml = '';
        if ((s.id === 'isabella' && state.clues.includes('clue-isa-in-files')) ||
            (s.id === 'marcus' && state.clues.includes('clue-mar-alibi-crack')) ||
            (s.id === 'blackwood' && state.clues.includes('clue-bw-formula'))) {
          sirHtml = '<div class="suspect-field"><span class="suspect-field-label">Sir</span><span class="suspect-field-value revealed-lie">' + s.secret + '</span></div>';
        }
        return '<div class="suspect-card">' +
          '<div class="suspect-card-header"><div class="suspect-card-badge ' + s.badgeClass + '">' + s.emoji + '</div>' +
          '<div><div class="suspect-card-name">' + s.name + '</div><div class="suspect-card-role">' + s.title + '</div></div></div>' +
          '<div class="suspect-card-body">' +
          '<div class="suspect-field"><span class="suspect-field-label">Alibi</span><span class="suspect-field-value">' + s.alibi + alibiTxt + '</span></div>' +
          '<div class="suspect-field"><span class="suspect-field-label">Motivasyon</span><span class="suspect-field-value">' + s.motivation + '</span></div>' +
          '<div class="suspect-field"><span class="suspect-field-label">Sorgulama</span><span class="suspect-field-value">' + asked + '/' + total + ' soru</span></div>' +
          sirHtml + '</div></div>';
      }).join('');

    } else if (tab === 'timeline') {
      var entries = [
        { time: '22:00',  key: false, text: 'Dukkan kapatiliyor. Elias bodrum katina iniyor.' },
        { time: '~22:30', key: false, text: 'Katil, havalandirmaya buz kapsulunu yerlestiriyor.' },
        { time: '~23:00', key: false, text: 'Kasa ici isinmaya basliyor. Kapsul eriyor.' },
        { time: '~23:20', key: true,  text: 'Norotoksin gaz halinde kasaya dolmaya basliyor.' },
        { time: '~23:25', key: false, text: 'Elias kasaya kosup kendini iceriden kilitleyor.' },
        { time: '~23:29', key: false, text: 'Kan ile "ZAMAN" yazisini cizyor.' },
        { time: '23:30',  key: true,  text: 'Elias Thorne hayatini kaybediyor.' },
        { time: '02:14',  key: false, text: 'Alarm sistemi devreye giriyor.' },
        { time: '02:31',  key: false, text: 'Polis ekibi geliyor. Kasa iceriden kilitli.' }
      ];
      el.innerHTML = '<div style="padding:0.4rem 0">' + entries.map(function(e) {
        return '<div class="timeline-entry">' +
          '<span class="timeline-time">' + e.time + '</span>' +
          '<div class="timeline-dot' + (e.key ? ' key' : '') + '"></div>' +
          '<span class="timeline-text">' + e.text + '</span></div>';
      }).join('') + '</div>';
    }
  }

  function flashClueNotice() {
    var tab = document.querySelector('.notebook-tab');
    if (!tab) return;
    tab.style.color = '#a8d4a8';
    tab.style.borderColor = '#a8d4a8';
    setTimeout(function() { tab.style.color = ''; tab.style.borderColor = ''; }, 2200);
  }

  function addItem(item) {
    if (state.inventory.find(function(i){ return i.id === item.id; })) return;
    state.inventory.push(item);
    renderInventory();
  }

  function setFlag(key, val) {
    state.flags[key] = (val === undefined) ? true : val;
  }

  // ── LOAD SCENE ────────────────────────────────────────────
  function loadScene(sceneId) {
    var scene = SCENES[sceneId];
    if (!scene) return;
    state.currentScene = sceneId;
    state.visitedScenes.add(sceneId);
    setLocationLabel(scene.name);
    setDescription(scene.description);
    dialog('Dedektif', scene.dialog);
    SceneRenderer.draw(sceneId);
    renderActions(scene);
    refreshHotspots();
  }

  // ── RENDER ACTIONS ────────────────────────────────────────
  function renderActions(scene) {
    var container = document.getElementById('action-buttons');
    container.innerHTML = '';

    if (scene.id === 'suspects-hub') {
      addSectionTitle(container, 'SUPHELILER');
      scene.actions.filter(function(a){ return a.suspectBtn; }).forEach(function(act) {
        var btn = buildBtn(act);
        if (btn) { btn.classList.add('suspect-btn'); if (act.suspectBtn !== 'a') btn.classList.add('suspect-' + act.suspectBtn); container.appendChild(btn); }
      });
      addSectionTitle(container, 'LOKASYONLAR');
      scene.actions.filter(function(a){ return a.next && !a.suspectBtn; }).forEach(function(act) {
        var btn = buildBtn(act); if (btn) container.appendChild(btn);
      });
      addSectionTitle(container, 'SUCLAAMA');
      scene.actions.filter(function(a){ return a.requiresClues; }).forEach(function(act) {
        var btn = buildBtn(act); if (btn) container.appendChild(btn);
      });
    } else {
      scene.actions.forEach(function(act) {
        var btn = buildBtn(act); if (btn) container.appendChild(btn);
      });
    }
  }

  function addSectionTitle(container, txt) {
    var d = document.createElement('div');
    d.className = 'action-section-title';
    d.textContent = txt;
    container.appendChild(d);
  }

  function buildBtn(act) {
    if (!act.label) return null;
    var btn = document.createElement('button');
    btn.className = 'btn-action';
    btn.textContent = act.label;
    if (act.requiresClues) {
      var canDo = checkCanAccuse();
      btn.disabled = !canDo;
      if (canDo) { btn.classList.add('highlight'); btn.classList.add('pulse'); }
    }
    btn.addEventListener('click', function() {
      if (act.next) {
        loadScene(act.next);
      } else if (act.action && ACTIONS[act.action]) {
        ACTIONS[act.action]();
        renderActions(SCENES[state.currentScene]);
        SceneRenderer.draw(state.currentScene);
      }
    });
    return btn;
  }

  function checkCanAccuse() {
    if (state.currentChapter === 1) {
      return state.clues.includes('clue-vent') && state.clues.includes('clue-body') &&
             state.clues.includes('clue-writing') && state.clues.includes('clue-examine');
    }
    return ['clue-isa-in-files','clue-mar-alibi-crack','clue-bw-camera','clue-bw-formula'].every(function(c){ return state.clues.includes(c); });
  }

  function refreshHotspots() {
    var scene = SCENES[state.currentScene];
    if (!scene) return;
    var layer = document.getElementById('hotspot-layer');
    layer.innerHTML = '';
    scene.hotspots.forEach(function(hs) {
      if (hs.hidden && hs.requiredFlag && !state.flags[hs.requiredFlag]) return;
      var div = document.createElement('div');
      div.className = 'hotspot';
      div.style.left = hs.x + '%'; div.style.top = hs.y + '%';
      div.style.width = hs.w + '%'; div.style.height = hs.h + '%';
      var lbl = document.createElement('span');
      lbl.className = 'hotspot-label'; lbl.textContent = hs.label;
      div.appendChild(lbl);
      div.addEventListener('click', function() {
        if (ACTIONS[hs.action]) {
          ACTIONS[hs.action]();
          renderActions(SCENES[state.currentScene]);
          SceneRenderer.draw(state.currentScene);
        }
      });
      layer.appendChild(div);
    });
  }

  // ── SAAT / HAMLE SİSTEMİ ─────────────────────────────────
  // (Saat sistemi kaldirildi)

  // ── ENVANTER DETAY GORUNUMU ───────────────────────────────
  function showItemDetail(item) {
    var overlay = document.getElementById('item-detail-overlay');
    if (!overlay) return;
    document.getElementById('item-detail-name').textContent = item.label;
    document.getElementById('item-detail-text').textContent = item.detail || 'Bu esya hakkinda daha fazla bilgi yok.';
    overlay.classList.remove('hidden');
  }

  function renderInventory() {
    var el = document.getElementById('inventory-items');
    if (state.inventory.length === 0) { el.innerHTML = '<span class="inv-empty">Bos</span>'; return; }
    el.innerHTML = '';
    state.inventory.forEach(function(item) {
      var span = document.createElement('span');
      span.className = 'inv-item';
      span.title = item.label;
      span.textContent = item.label;
      span.addEventListener('click', function() { showItemDetail(item); });
      el.appendChild(span);
    });
  }

  // ── FINAL KARAR EKRANI ────────────────────────────────────
  function showFinalDecisionScreen() {
    var overlay = document.getElementById('result-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('result-icon').textContent = '?';
    document.getElementById('result-title').textContent = 'FINAL KARAR';

    document.getElementById('result-text').innerHTML =
      '<p style="margin-bottom:1rem">Tum kanitlari topladınız. Simdi katili, silahı ve sebebi dogru secmelisiniz.</p>' +
      '<div class="decision-group">' +
        '<div class="decision-label">KATIL KIM?</div>' +
        '<div class="decision-options" id="dec-suspect">' +
          '<button class="decision-btn" data-val="isabella" onclick="Game.selectDecision(\'suspect\',\'isabella\',this)">Isabella Reed</button>' +
          '<button class="decision-btn" data-val="marcus"   onclick="Game.selectDecision(\'suspect\',\'marcus\',this)">Marcus Vance</button>' +
          '<button class="decision-btn" data-val="blackwood" onclick="Game.selectDecision(\'suspect\',\'blackwood\',this)">Dr. Aris Blackwood</button>' +
        '</div>' +
      '</div>' +
      '<div class="decision-group">' +
        '<div class="decision-label">CINAYET SILAHI / YONTEMI?</div>' +
        '<div class="decision-options" id="dec-weapon">' +
          '<button class="decision-btn" data-val="poison"  onclick="Game.selectDecision(\'weapon\',\'poison\',this)">Norotoksin zehri (igne/icerek)</button>' +
          '<button class="decision-btn" data-val="capsule" onclick="Game.selectDecision(\'weapon\',\'capsule\',this)">Buz kapsulunde gaz halinde zehir</button>' +
          '<button class="decision-btn" data-val="manual"  onclick="Game.selectDecision(\'weapon\',\'manual\',this)">Fiziksel saldiri</button>' +
        '</div>' +
      '</div>' +
      '<div class="decision-group">' +
        '<div class="decision-label">SEBEP / MOTIVASYON?</div>' +
        '<div class="decision-options" id="dec-motive">' +
          '<button class="decision-btn" data-val="formula"  onclick="Game.selectDecision(\'motive\',\'formula\',this)">Calınan formul kitabini geri almak</button>' +
          '<button class="decision-btn" data-val="blackmail" onclick="Game.selectDecision(\'motive\',\'blackmail\',this)">Santaj dosyasini imha etmek</button>' +
          '<button class="decision-btn" data-val="revenge"  onclick="Game.selectDecision(\'motive\',\'revenge\',this)">Salt intikam</button>' +
        '</div>' +
      '</div>' +
      '<div id="decision-feedback" class="decision-feedback"></div>';

    document.getElementById('result-actions').innerHTML =
      '<button class="btn-primary" onclick="Game.submitDecision()">KARARI ONAYLA</button>' +
      '<button class="btn-primary" style="margin-left:0.8rem;border-color:var(--text-dim);color:var(--text-dim)" onclick="Game.restartGame()">VAZGEC / TEKRAR OYNA</button>';
  }

  var _decisions = { suspect: null, weapon: null, motive: null };

  function showFinalAccusation() { showFinalDecisionScreen(); }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    startGame: function() {
      showScreen('game');
      SceneRenderer.init();
      loadScene('entrance');
    },

    restartGame: function() {
      state = {
        currentScene: null, currentChapter: 1, clues: [], inventory: [],
        visitedScenes: new Set(), flags: {}, notebookTab: 'clues',
        suspects: {
          isabella: { questionsAsked: [], alibiChallenged: false, resistance: 3 },
          marcus:   { questionsAsked: [], alibiChallenged: false, resistance: 3 },
          blackwood:{ questionsAsked: [], alibiChallenged: false, resistance: 3 }
        }
      };
      _decisions = { suspect: null, weapon: null, motive: null };
      document.getElementById('result-overlay').classList.add('hidden');
      document.getElementById('notebook-overlay').classList.add('hidden');
      document.getElementById('chapter-transition').classList.add('hidden');
      var ido = document.getElementById('item-detail-overlay');
      if (ido) ido.classList.add('hidden');
      document.getElementById('chapter-label').textContent = 'BOLUM 1';
      updateClueCount(); updateNotebook(); renderInventory();
      loadScene('entrance');
    },

    toggleNotebook: function() {
      var overlay = document.getElementById('notebook-overlay');
      overlay.classList.toggle('hidden');
      if (!overlay.classList.contains('hidden')) renderNotebookTab(state.notebookTab);
    },

    switchNotebookTab: function(tab, btnEl) {
      document.querySelectorAll('.nb-tab').forEach(function(b){ b.classList.remove('active'); });
      if (btnEl) btnEl.classList.add('active');
      renderNotebookTab(tab);
    },

    closeInterrogation: function() {
      document.getElementById('interrogation-overlay').classList.add('hidden');
      SceneRenderer.draw(state.currentScene);
      renderActions(SCENES[state.currentScene]);
    },

    proceedChapter: function() {
      document.getElementById('chapter-transition').classList.add('hidden');
      if (_chapterCallback) { _chapterCallback(); _chapterCallback = null; }
    },

    closeItemDetail: function() {
      var el = document.getElementById('item-detail-overlay');
      if (el) el.classList.add('hidden');
    },

    selectDecision: function(type, val, btnEl) {
      _decisions[type] = val;
      // Ayni gruptaki butonlardan secimi kaldir
      var group = btnEl.parentElement;
      group.querySelectorAll('.decision-btn').forEach(function(b){ b.classList.remove('selected'); });
      btnEl.classList.add('selected');
    },

    submitDecision: function() {
      var correct = (_decisions.suspect === 'blackwood' && _decisions.weapon === 'capsule' && _decisions.motive === 'formula');
      var partial = (_decisions.suspect === 'blackwood');
      var fb = document.getElementById('decision-feedback');

      if (!_decisions.suspect || !_decisions.weapon || !_decisions.motive) {
        fb.textContent = 'Lutfen her uc kategori icin de bir secim yapin.';
        fb.className = 'decision-feedback warn';
        return;
      }

      var rIcon = document.getElementById('result-icon');
      var rTitle = document.getElementById('result-title');
      var rText = document.getElementById('result-text');
      var rActions = document.getElementById('result-actions');

      if (correct) {
        rIcon.textContent = 'OK';
        rTitle.textContent = 'TEBRIKLER - DAVA COZULDU';
        rText.innerHTML =
          '<p style="margin-bottom:0.8rem"><strong style="color:var(--accent)">Katil: Dr. Aris Blackwood</strong> - dogru!</p>' +
          '<p style="margin-bottom:0.8rem">Sehir disinda oldugunu iddia etti; otopark kameralari bunu curuttuu. Norotoksin sentezi bilgisine ve buz kapsulu mekanizmasina sahip tek kisi. Eliasın caldigi formul kitabini geri almak icin bu tuzagi kurdu.</p>' +
          '<p style="margin-bottom:0.8rem"><strong style="color:var(--accent)">Silah:</strong> Havalandirma kanalina yerlestirilen buz kapsulu - isi artinca eridi, norotoksin gaz halinde kasaya doldu.</p>' +
          '<p><strong style="color:var(--accent)">"ZAMAN" notu:</strong> Elias olurken mekanizmanin zamanlamasini - yani sicakliga bagli tetiklenme anini - isaret ediyordu. Katilin adini degil, sistemi soyluyordu.</p>';
        rActions.innerHTML = '<button class="btn-primary" onclick="Game.restartGame()">TEKRAR OYNA</button>';
      } else if (partial) {
        rIcon.textContent = '~';
        rTitle.textContent = 'YAKIN - AMA EKSIK';
        rText.innerHTML =
          '<p>Katili dogru buldunuz ama silah veya sebep yanlis.</p>' +
          '<p style="margin-top:0.6rem">Ipucu: Cinayet aleti kasaya fiziksel olarak girilmeden calisti. Motivasyon ise Eliasın yillar once caldigi bir seyi geri almakla ilgiliydi.</p>';
        rActions.innerHTML =
          '<button class="btn-primary" onclick="Game.showDecisionAgain()">TEKRAR DENE</button>' +
          '<button class="btn-primary" style="margin-left:0.7rem;border-color:var(--text-dim);color:var(--text-dim)" onclick="Game.restartGame()">BASTAN OYNA</button>';
      } else {
        rIcon.textContent = '!';
        rTitle.textContent = 'YANLIS SUCLAAMA';
        rText.innerHTML =
          '<p>Bu kisi katil degil. Yanlis suclaama yaptiniz.</p>' +
          '<p style="margin-top:0.6rem">Ipuclarina geri donun - ozellikle havalandirma izgarasi ve otopark kamera kayitlari kritik.</p>';
        rActions.innerHTML =
          '<button class="btn-primary" onclick="Game.showDecisionAgain()">TEKRAR DENE</button>' +
          '<button class="btn-primary" style="margin-left:0.7rem;border-color:var(--text-dim);color:var(--text-dim)" onclick="Game.restartGame()">BASTAN OYNA</button>';
      }
    },

    showDecisionAgain: function() {
      _decisions = { suspect: null, weapon: null, motive: null };
      showFinalDecisionScreen();
    }
  };

})();
