import { Scenario } from "./types";

export const predefinedScenarios: Scenario[] = [
  {
    scenario_title: "Kanser Teşhisi ve Kemoterapi Reddi (Ahmet Bey)",
    target_audience: "Hemşirelik ve Tıp Fakültesi Öğrencileri",
    nodes: [
      {
        id: "START",
        speaker: "Anlatıcı",
        text: "Onkoloji servisinde görevlisiniz. 52 yaşındaki Ahmet Bey'e az önce ileri evre akciğer kanseri teşhisi kondu ve önerilen kemoterapi tedavisini öfkeyle reddediyor: 'Bana o zehri vermenize izin vermeyeceğim! Zaten öleceğim, bari saçlarım dökülmeden, sürünmeden onurlu bir şekilde öleyim!' diyor. Odasına giriyorsunuz. Nasıl başlayacaksınız?",
        emotion: "neutral",
        node_type: "intro",
        choices: [
          {
            text: "Empatik Yaklaşım: Ahmet Bey'in öfkesinin ardındaki derin kaygıyı doğrulamak ve açık uçlu soru sormak.",
            next_node_id: "EMPATIK_YOL_1"
          },
          {
            text: "Görev Odaklı Yaklaşım: Tıbbi zorunlulukları hatırlatmak ve reddetme formuna odaklanmak.",
            next_node_id: "MEKANIK_YOL_1"
          },
          {
            text: "Geçiştirici Yaklaşım: Yanlış güvence vererek durumu hafifletmeye çalışmak.",
            next_node_id: "GECISTIRICI_YOL_1"
          }
        ]
      },
      {
        id: "EMPATIK_YOL_1",
        speaker: "Hasta",
        text: "Ahmet Bey yatağında dikleşiyor, gözleri nemli... 'Zehir diyorum size! Komşum o tedaviyi aldı, eridi bitti... Gözümün önünde acı çekerek öldü! Ben de öyle mi olayım yani? Saçlarım dökülecek, sürekli kusacağım... Sevdiklerimin karşısına o halde çıkmak istemiyorum!' diyor. Ne cevap vereceksiniz?",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Duyguyu Doğrulama: 'Komşunuzun yaşadığı zorlu sürece tanık olmak sizi çok sarsmış olmalı. Sevdiklerinizin karşısında zayıf görünme korkunuzu anlıyorum.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Tıbbi Bilgilendirme: 'Ahmet Bey, her hastanın yan etkisi aynı olmaz. Günümüzde yan etkileri önleyen çok güçlü ilaçlarımız var.'",
            next_node_id: "MEKANIK_YOL_2"
          },
          {
            text: "Geçiştirme: 'Aman Ahmet Bey, bunları düşünmeyin şimdiden. Hem komşunuz kim bilir kaç yaşındaydı, sizin bünyeniz çok daha sağlam görünüyor!'",
            next_node_id: "GECISTIRICI_YOL_2"
          }
        ]
      },
      {
        id: "EMPATIK_YOL_2",
        speaker: "Hasta",
        text: "Ahmet Bey'in omuzları düşüyor, derin bir nefes alıyor... 'Evet... Eşim ve çocuklarım benim bu halimi görürse yıkılırlar. Ben bu evin direğiyim. Onlara yük olmak, muhtaç kalmak ölümden daha ağır geliyor bana... Ben sadece acı çekmeden, huzurla gitmek istiyorum...' diyor. Son hamleniz ne olacak?",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Ortak Karar ve Destek Ekibi Daveti: 'Evin direği olmak ve ailenizi korumak istemeniz çok asil bir duygu. Gelin eşinizle de konuşup, acı yönetimi ve psikolojik destek ekiplerimizle süreci birlikte planlayalım.'",
            next_node_id: "SON_EMPATIK_MUKEMMEL"
          },
          {
            text: "Israr: 'Aileniz sizin iyileşmenizi ister Ahmet Bey. Biz hemen onayınızı alıp tedaviye başlayalım, zaman kaybediyoruz.'",
            next_node_id: "SON_MEKANIK_FORMAL"
          },
          {
            text: "Konuyu Değiştirme: 'Siz hiç merak etmeyin, aileniz güçlüdür. Hadi gelin bugünlük bu ağır konuları kapatalım, yarın tekrar bakarız.'",
            next_node_id: "SON_GECISTIRICI_KOPUS"
          }
        ]
      },
      {
        id: "MEKANIK_YOL_1",
        speaker: "Hasta",
        text: "Ahmet Bey öfkeyle elini masaya vuruyor! 'Bana kağıt imzalatıp sorumluluktan kaçmak istiyorsunuz, değil mi?! Sizin için sadece bir sayıdan ibaretim! Doktorunuz da siz de benim ne hissettiğimi umursamıyorsunuz! Çıkın gidin odamdan!' diye bağırıyor. Şimdi ne yapacaksınız?",
        emotion: "angry",
        node_type: "choice_point",
        choices: [
          {
            text: "Geri Adım Atıp Özür Dileme: 'Özür dilerim Ahmet Bey, sizi aceleye getirdiğimi ve dinlemediğimi hissettirdim. Sizi gerçekten dinlemek için buradayım, lütfen anlatın.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Sınır Koyma ve Profesyonel Mesafe: 'Size sadece yasal haklarınızı hatırlatıyorum. Bizim amacımız size zarar vermek değil. Sakinleştiğinizde tekrar konuşuruz.'",
            next_node_id: "SON_MEKANIK_KOPUS"
          },
          {
            text: "Geçiştirici Savunma: 'Yok canım ne sorumluluğu, biz sizin iyiliğinizi düşünüyoruz sadece. Neden bu kadar sinirlendiniz ki?'",
            next_node_id: "SON_GECISTIRICI_KOPUS"
          }
        ]
      },
      {
        id: "GECISTIRICI_YOL_1",
        speaker: "Hasta",
        text: "Ahmet Bey acı bir şekilde gülüyor... 'Korkma geçer mi?! Siz benimle dalga mı geçiyorsunuz? Akciğer kanseriyim diyorum, siz her şey çok kolay olacak gibi konuşuyorsunuz! Bana yalan söylemeyin! Gerçekleri söyleyecek cesaretiniz yoksa benimle konuşmayın!' diyor. İletişimi nasıl kurtaracaksınız?",
        emotion: "defensive",
        node_type: "choice_point",
        choices: [
          {
            text: "Dürüstlük ve Yüzleşme: 'Haklısınız, durumu hafife alır gibi konuşarak saygısızlık ettim. Bu çok ciddi bir durum ve korkmakta tamamen haklısınız. Özür dilerim.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Mekanik Bilgilendirmeye Dönüş: 'Peki, o zaman açık konuşayım: Kemoterapi almazsanız birkaç ay içinde nefes darlığı ve şiddetli kemik ağrılarıyla karşı karşıya kalacaksınız.'",
            next_node_id: "SON_MEKANIK_KORKU"
          },
          {
            text: "Sessiz Kalıp Uzaklaşma: 'Ben en iyisi sizi yalnız bırakayım, daha fazla rahatsız etmeyeyim.'",
            next_node_id: "SON_OLUMSUZ_GECISTIRME"
          }
        ]
      },
      {
        id: "MEKANIK_YOL_2",
        speaker: "Hasta",
        text: "Ahmet Bey kollarını göğsünde kavuşturup duvara bakıyor... 'İlaçlar, istatistikler, yüzdeler... Hep aynı şeyler! Ben bir makine değilim! O yan etki ilaçları da başka bir zehir vücudum için. Beni duymuyorsunuz bile...' diyor. Ne yapacaksınız?",
        emotion: "defensive",
        node_type: "choice_point",
        choices: [
          {
            text: "Duygusal Bağ Kurma: 'Sizi duymadığımı hissettiğiniz için üzgünüm. Haklısınız, siz bir istatistik değilsiniz, siz Ahmet Bey'siniz. Sizin için tedavi dışında ne yapabileceğimizi konuşalım.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Israrcı Tıbbi Argüman: 'Biz bilimsel verilere göre hareket etmek zorundayız Ahmet Bey. Kemoterapi en etkili yöntemimiz.'",
            next_node_id: "SON_MEKANIK_KOPUS"
          },
          {
            text: "Yanlış Güvence: 'Hiç de zehir değil canım, hepsi onaylı ilaçlar. Sıkmayın canınızı.'",
            next_node_id: "SON_OLUMSUZ_GECISTIRME"
          }
        ]
      },
      {
        id: "GECISTIRICI_YOL_2",
        speaker: "Hasta",
        text: "Ahmet Bey başını sallıyor, göz temasını tamamen kesiyor... 'Bünyem mi sağlam? Komşum benden gençti ve sapasağlamdı! Siz beni teselli etmek için masal anlatıyorsunuz. Lütfen gidin, dinlenmek istiyorum...' diyerek arkasını dönüyor. Son şansınız:",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Hatalı Güvenceden Vazgeçip Empati Yapma: 'Ahmet Bey, özür dilerim. Acınızı ve korkunuzu geçiştirmeye hakkım yoktu. Komşunuzun kaybı sizi haklı olarak dehşete düşürmüş. Sessizce yanınızda oturmamı ister misiniz?'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Tıbbi Prosedüre Sığınma: 'Peki, dinlenin. Ama yarın sabah doktor vizitinde kemoterapi kararınızı netleştirmeniz gerekiyor, unutmayın.'",
            next_node_id: "SON_MEKANIK_FORMAL"
          },
          {
            text: "Odayı Terk Etme: 'Nasıl isterseniz, iyi dinlenmeler.'",
            next_node_id: "SON_OLUMSUZ_GECISTIRME"
          }
        ]
      },
      {
        id: "SON_EMPATIK_MUKEMMEL",
        speaker: "Anlatıcı",
        text: "Harika bir klinik iletişim başarısı! Ahmet Bey'in maskelediği 'ailesine yük olma' ve 'acı çekme' kaygılarını başarıyla açığa çıkardınız ve ona bir numara olarak değil, bir insan olarak yaklaştınız. Ahmet Bey ağlayarak içini döktü, eşinin de katıldığı bir görüşmeyi kabul etti. Destekleyici onkoloji ekibiyle birlikte tedavi planına uyum sağlama ihtimali çok yükseldi.",
        emotion: "reassuring",
        node_type: "end_node",
        score_impact: "Yüksek Başarı (+8/8)",
        choices: []
      },
      {
        id: "SON_MEKANIK_FORMAL",
        speaker: "Anlatıcı",
        text: "Tıbbi prosedürleri tamamladınız ancak hastanın ruhsal dünyasını ıskaladınız. Ahmet Bey tedaviyi tamamen reddetmedi ama bunu sadece 'zorunluluktan' kabul etti. Size karşı soğuk ve güvensiz. Tedavi sürecinde yaşayacağı en ufak bir psikolojik krizde tedaviyi yarıda bırakma riski çok yüksek. Mekanik ve soğuk bir iletişim modeli sergilediniz.",
        emotion: "neutral",
        node_type: "end_node",
        score_impact: "Orta Başarı (4/8)",
        choices: []
      },
      {
        id: "SON_MEKANIK_KOPUS",
        speaker: "Anlatıcı",
        text: "İletişim tamamen koptu. Ahmet Bey'i yasal formlarla ve tıbbi otoriteyle köşeye sıkıştırmaya çalıştınız. O ise bunu bir tehdit olarak algıladı ve öfkesi katlandı. Tedaviyi kesin olarak reddediyor ve sizinle bir daha görüşmek istemiyor. Hastayı klinik olarak kaybettiniz.",
        emotion: "worried",
        node_type: "end_node",
        score_impact: "Düşük Başarı (1/8)",
        choices: []
      },
      {
        id: "SON_OLUMSUZ_GECISTIRME",
        speaker: "Anlatıcı",
        text: "Hastayı sahte gülücükler ve anlamsız iyimserliklerle geçiştirdiniz. Ahmet Bey kendisinin ciddiye alınmadığını hissederek tamamen içine kapandı. Sorularına dürüst yanıtlar alamadığı için sağlık ekibine olan inancını kaybetti. Odasında yalnız ve çaresiz bir şekilde ölümü beklemeyi tercih ediyor.",
        emotion: "sad",
        node_type: "end_node",
        score_impact: "Çok Düşük Başarı (0/8)",
        choices: []
      },
      {
        id: "SON_MEKANIK_KORKU",
        speaker: "Anlatıcı",
        text: "Hastayı korkutarak ve gelecekte çekeceği acıları gözünün önüne sererek ikna etmeye çalıştınız. Ahmet Bey dehşet içinde tedaviyi istemeyerek kabul etti ancak bu süreç onda derin bir travma yarattı. Size ve kuruma karşı büyük bir nefret besliyor.",
        emotion: "fearful",
        node_type: "end_node",
        score_impact: "Düşük Başarı (2/8)",
        choices: []
      },
      {
        id: "SON_GECISTIRICI_KOPUS",
        speaker: "Anlatıcı",
        text: "İletişimi çocuksu geçiştirmelerle sabote ettiniz. Ahmet Bey öfkeyle sizi odadan kovdu ve başka bir hemşire veya doktor talep etti. Profesyonel güven ilişkisi tamamen sarsıldı.",
        emotion: "angry",
        node_type: "end_node",
        score_impact: "Çok Düşük Başarı (0/8)",
        choices: []
      }
    ]
  },
  {
    scenario_title: "Yoğun Bakımda Yakınını Kaybeden Öfkeli Hasta Yakını",
    target_audience: "Tıp, Hemşirelik ve Sağlık Yönetimi Öğrencileri",
    nodes: [
      {
        id: "START",
        speaker: "Anlatıcı",
        text: "Yoğun bakım kapısındasınız. 72 yaşındaki kalp hastası Fatma Hanım tüm müdahalelere rağmen kaybedilmiştir. Oğlu Murat Bey kapıda beklemektedir. Hekim ve sorumlu hemşire olarak bu kötü haberi vermeniz ve Murat Bey'in suçlayıcı öfkesiyle başa çıkmanız gerekmektedir. Murat Bey bağırarak yaklaşıyor: 'Annem sapasağlam girmişti buraya! Siz onu öldürdünüz! Onu ihmal ettiniz değil mi?!' Ne yapacaksınız?",
        emotion: "neutral",
        node_type: "intro",
        choices: [
          {
            text: "Empatik Yaklaşım: Murat Bey'in acısını kabul etmek, sakin bir odaya davet etmek ve duygusunu doğrulamak.",
            next_node_id: "EMPATIK_YOL_1"
          },
          {
            text: "Savunmacı Yaklaşım: Tıbbi raporları öne sürerek suçlamayı reddetmek ve otopsi hakkından bahsetmek.",
            next_node_id: "SAVUNMACI_YOL_1"
          },
          {
            text: "Geçiştirici Yaklaşım: 'Takdir-i ilahi, yapacak bir şey yok, herkes bir gün ölecek' diyerek sakinleştirmeye çalışmak.",
            next_node_id: "GECISTIRICI_YOL_1"
          }
        ]
      },
      {
        id: "EMPATIK_YOL_1",
        speaker: "Hasta Yakını",
        text: "Murat Bey ağlayarak duvara vuruyor! 'Bana sakin ol demeyin! O benim her şeyimdi... Dün akşam bana el sallamıştı. Nasıl olur da bir gecede ölür?! Siz bir hata yaptınız, benden saklıyorsunuz!' diyerek hıçkırıyor. Cevabınız:",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Aktif Dinleme ve Paylaşım: 'Murat Bey, annenizin ani kaybı karşısında hissettiğiniz bu büyük acıyı ve isyanı derinden hissedebiliyorum. Gelin şuraya oturalım, dün geceden beri yapılan her müdahaleyi size dürüstçe anlatayım.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Teknik Açıklama: 'Murat Bey, annenizin kalp yetmezliği son evredeydi. Ani bir aritmi gelişti ve kalbi durdu. Tıbbi hata söz konusu olamaz.'",
            next_node_id: "MEKANIK_YOL_2"
          },
          {
            text: "Geçiştirici Teselli: 'Lütfen kendinizi böyle yıpratmayın Murat Bey, anneniz acılarından kurtuldu, şimdi daha iyi bir yerde.'",
            next_node_id: "GECISTIRICI_YOL_2"
          }
        ]
      },
      {
        id: "EMPATIK_YOL_2",
        speaker: "Hasta Yakını",
        text: "Murat Bey başını ellerinin arasına alıyor, hıçkırıkları sakinleşiyor... 'Ben... ona veda bile edemedim... Son anında yanında olamadım. Bu vicdan azabıyla nasıl yaşayacağım ben? Annem beni yalnız bıraktı...' diyor. Kriz anındaki son yaklaşımınız:",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Terapötik Veda Desteği: 'Kendinizi suçlamayın Murat Bey, siz onun için elinizden gelen her şeyi yaptınız. Dilerseniz odasına girelim, onunla sessizce vedalaşmanız için size özel bir zaman tanıyalım. Ben de yanınızda olacağım.'",
            next_node_id: "SON_EMPATIK_MUKEMMEL"
          },
          {
            text: "Mekanik İşlemler: 'Veda için vakit dar, morga kaldırılmadan önce imza ve teslim işlemlerini halletmemiz gerekiyor.'",
            next_node_id: "SON_MEKANIK_FORMAL"
          },
          {
            text: "Konuyu Değiştirme: 'Böyle düşünmeyin, hayat devam ediyor. Sizin de bir aileniz var, güçlü durmalısınız.'",
            next_node_id: "SON_GECISTIRICI_KOPUS"
          }
        ]
      },
      {
        id: "SAVUNMACI_YOL_1",
        speaker: "Hasta Yakını",
        text: "Murat Bey daha da öfkeleniyor! 'Bana tıbbi terimler gevelemeyin! Raporlarınız batsın! Katilsiniz siz! Mahkemeye vereceğim hepinizi, lisansınızı iptal ettireceğim!' diye bağırıyor ve üzerinize yürüyor. Ne yapacaksınız?",
        emotion: "angry",
        node_type: "choice_point",
        choices: [
          {
            text: "Empatik Geri Adım: 'Öfkenizi ve canınızın ne kadar yandığını anlıyorum Murat Bey. Savunmaya geçerek acınızı hafife aldım, çok özür dilerim. Lütfen bana kızın ama kendinize zarar vermeyin.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Güvenlik Çağırma ve Tehdit Etme: 'Beni tehdit edemezsiniz! Güvenliği çağırıyorum. Hakaretleriniz için ben de sizden şikayetçi olacağım.'",
            next_node_id: "SON_MEKANIK_KOPUS"
          },
          {
            text: "Geçiştirme: 'Murat Bey sakin olun lütfen, her ölümde bir suçlu aramak doğru değil.'",
            next_node_id: "SON_OLUMSUZ_GECISTIRME"
          }
        ]
      },
      {
        id: "GECISTIRICI_YOL_1",
        speaker: "Hasta Yakını",
        text: "Murat Bey yakalarınızdan tutacak gibi yaklaşıyor! 'Takdir-i ilahi mi?! Kolay mı bu kadar söylemek?! Sizin anneniz ölmedi ki! Burası ticarethane olmuş, hastaları ölüme terk ediyorsunuz!' diyor. Nasıl kurtaracaksınız?",
        emotion: "angry",
        node_type: "choice_point",
        choices: [
          {
            text: "Dürüst Hata Kabulü ve Özür: 'Çok haklısınız, acınızın büyüklüğü karşısında kurduğum cümle çok uygunsuzdu. Çok büyük bir kayıp yaşıyorsunuz, özür dilerim. Sizi dinliyorum.'",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Prosedür Hatırlatma: 'Hastanemizin kuralları gereği yoğun bakım önünde beklemek yasaktır. Lütfen bekleme salonuna geçin.'",
            next_node_id: "SON_MEKANIK_KOPUS"
          },
          {
            text: "Tepkisiz Kalıp Güvenlik İsteme: 'Sizinle bu şekilde konuşamam.' diyerek odaya kilitlenmek.",
            next_node_id: "SON_GECISTIRICI_KOPUS"
          }
        ]
      },
      {
        id: "MEKANIK_YOL_2",
        speaker: "Hasta Yakını",
        text: "Murat Bey boş gözlerle bakıyor... 'Yetmezlik... Kalp durması... Hepsi kılıf! Annemi yalnız bıraktınız, acı çekti ve yardım isteyemedi. Sizin vicdanınız rahat mı gerçekten?' diyor. Cevabınız:",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Duygusal Temas: 'Ahmet Bey, tüm gece boyunca annenizin başucundaydık, ellerini tuttuk. Acı çekmemesi için tüm tedavileri uyguladık. İnanın biz de onu kurtarmayı çok istedik...' diyerek elini omzuna koymak.",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Yasal Prosedürler: 'Vicdanımız rahat, tüm kayıtlar mevcuttur. Dilerseniz savcılığa başvurup kamera kayıtlarını talep edebilirsiniz.'",
            next_node_id: "SON_MEKANIK_KOPUS"
          }
        ]
      },
      {
        id: "GECISTIRICI_YOL_2",
        speaker: "Hasta Yakını",
        text: "Murat Bey 'Daha iyi bir yerde mi?!' diye bağırıyor. 'Bana masal anlatmayın! O burada, soğuk bir odada yalnız başına öldü! Sizin teselliniz hiçbir işe yaramıyor!' diyerek başını kollarına gömüp hıçkırıyor. Son adımınız:",
        emotion: "sad",
        node_type: "choice_point",
        choices: [
          {
            text: "Suskunluk ve Sessiz Varlık: 'Haklısınız, hiçbir söz annenizi geri getiremez ve acınızı hafifletemez. Sadece acınızı paylaşmak için buradayım.' diyerek yanına oturmak.",
            next_node_id: "EMPATIK_YOL_2"
          },
          {
            text: "Evrakları Uzatma: 'Başınız sağ olsun. Şu eşya teslim formunu ve ölüm belgesini imzalamanız gerekiyor.'",
            next_node_id: "SON_MEKANIK_FORMAL"
          }
        ]
      },
      {
        id: "SON_EMPATIK_MUKEMMEL",
        speaker: "Anlatıcı",
        text: "Tebrikler! Olağanüstü bir kriz ve yas yönetimi örneği sergilediniz. Murat Bey'in suçlayıcı öfkesinin ardındaki derin suçluluk ve veda edememe acısını teşhis ettiniz. Ona veda etmesi için güvenli bir alan yarattınız. Murat Bey sağlık ekibine duyduğu öfkeyi aşarak sağlıklı bir yas sürecine girdi ve teşekkür ederek hastaneden ayrıldı.",
        emotion: "reassuring",
        node_type: "end_node",
        score_impact: "Yüksek Başarı (+8/8)",
        choices: []
      },
      {
        id: "SON_MEKANIK_FORMAL",
        speaker: "Anlatıcı",
        text: "Kötü haberi verdiniz ve yasal işlemleri tamamladınız, ancak hasta yakınının ağır psikolojik krizini yönetemediniz. Murat Bey derin bir vicdan azabı ve öfkeyle, işlemleri robot gibi yapıp gitti. Kuruma ve hekimlere karşı kalıcı bir güvensizlik hissedecek.",
        emotion: "neutral",
        node_type: "end_node",
        score_impact: "Orta Başarı (4/8)",
        choices: []
      },
      {
        id: "SON_MEKANIK_KOPUS",
        speaker: "Anlatıcı",
        text: "Kriz bir şiddet ve dava sarmalına dönüştü. Murat Bey'i güvenlik çağırarak ve yasal haklarla tehdit ederek daha da provoke ettiniz. Olay karakolda bitti. Ağır bir iletişim yetersizliği ve profesyonellik dışı kriz yönetimi.",
        emotion: "angry",
        node_type: "end_node",
        score_impact: "Çok Düşük Başarı (0/8)",
        choices: []
      },
      {
        id: "SON_GECISTIRICI_KOPUS",
        speaker: "Anlatıcı",
        text: "Sorumluluktan kaçarak odayı terk ettiniz veya konuyu geçiştirdiniz. Murat Bey hastane koridorlarında sinir krizi geçirdi, etrafa zarar verdi. Yas süreci travmatik bir şekilde baltalandı.",
        emotion: "worried",
        node_type: "end_node",
        score_impact: "Çok Düşük Başarı (0/8)",
        choices: []
      },
      {
        id: "SON_OLUMSUZ_GECISTIRME",
        speaker: "Anlatıcı",
        text: "Murat Bey'i teselli etmek yerine kendinizi savundunuz. Murat Bey hukuki süreç başlatacağını haykırarak hastaneyi terk etti. İletişim tamamen koptu.",
        emotion: "sad",
        node_type: "end_node",
        score_impact: "Düşük Başarı (1/8)",
        choices: []
      }
    ]
  }
];
