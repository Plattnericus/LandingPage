import type { OS } from "./osDetect";

/* The 50 languages covering the large majority of the site's likely global
   audience by native + second-language speaker count, picked from the usual
   "top world languages" lists rather than invented ad hoc. English is the
   only one with an exact OS menu path baked in, because it's the only one
   we can actually verify — Microsoft's and Apple's real on-screen strings.
   We have no reliable way to confirm their exact localized wording in the
   other 49, and a confident-looking wrong path misleads a visitor worse
   than an honest general pointer does, so every other language names the
   OS and points at the general settings area instead of faking precision.
   "Windows" and "Mac" stay as Latin-script brand names throughout, same as
   virtually all localized software leaves them.

   Every per-OS clause below is its own backtick template, nested inside the
   outer one — not a single "..." string — specifically so a language's own
   quotation marks (straight or curly, whichever reads naturally there) can
   never collide with the string delimiter itself. That collision is exactly
   what broke the first pass of this file. */
export type Lang =
  | "en"
  | "zh-Hans"
  | "zh-Hant"
  | "hi"
  | "es"
  | "fr"
  | "ar"
  | "bn"
  | "pt"
  | "ru"
  | "ur"
  | "id"
  | "de"
  | "ja"
  | "mr"
  | "te"
  | "tr"
  | "ta"
  | "vi"
  | "ko"
  | "it"
  | "pl"
  | "uk"
  | "ro"
  | "nl"
  | "th"
  | "gu"
  | "fa"
  | "pa"
  | "sw"
  | "ha"
  | "kn"
  | "ml"
  | "my"
  | "am"
  | "az"
  | "or"
  | "he"
  | "el"
  | "cs"
  | "sv"
  | "hu"
  | "fi"
  | "da"
  | "no"
  | "sk"
  | "bg"
  | "hr"
  | "ms"
  | "fil";

/** Scripts read right-to-left — the notice's text container flips `dir` for
    these so punctuation and text alignment land on the correct side instead
    of a left-to-right browser default fighting a right-to-left script. */
export const RTL_LANGS: ReadonlySet<Lang> = new Set(["ar", "ur", "fa", "he"]);

type Entry = {
  body: (os: OS) => string;
  dismiss: string;
};

export const COPY: Record<Lang, Entry> = {
  en: {
    body: (os) =>
      `This device has reduced motion turned on, so this page is showing its calm, static version on purpose — no 3D scene, mascot, or scroll animation. If that wasn't intentional, flip it back on in ${
        os === "windows"
          ? `Settings → Accessibility → Visual effects → Animation effects`
          : os === "mac"
            ? `System Settings → Accessibility → Display → Reduce motion`
            : `your device's accessibility or display settings, under something like “reduce motion”`
      }, then reload this page to see it.`,
    dismiss: "Dismiss this notice",
  },
  "zh-Hans": {
    body: (os) =>
      `此设备已开启"减弱动态效果"，因此本页面特意显示平静的静态版本——没有 3D 场景、没有吉祥物、也没有滚动动画。如果这并非你的本意，可以在${
        os === "windows"
          ? `Windows 的辅助功能设置中找到类似"动画效果"的选项`
          : os === "mac"
            ? `Mac 的系统设置的辅助功能里找到类似"减弱动态效果"的选项`
            : `设备的辅助功能或显示设置中找到类似"减少动态效果"的选项`
      }并重新开启，然后刷新本页面即可看到效果。`,
    dismiss: "关闭此提示",
  },
  "zh-Hant": {
    body: (os) =>
      `此裝置已開啟「減少動態效果」，因此此頁面特意顯示平靜的靜態版本——沒有 3D 場景、沒有吉祥物、也沒有捲動動畫。如果這並非你的本意，可以在${
        os === "windows"
          ? `Windows 的協助工具設定中找到類似「動畫效果」的選項`
          : os === "mac"
            ? `Mac 的系統設定的輔助使用裡找到類似「減少動態效果」的選項`
            : `裝置的協助工具或顯示設定中找到類似「減少動態效果」的選項`
      }並重新開啟，然後重新載入此頁面即可看到效果。`,
    dismiss: "關閉此提示",
  },
  hi: {
    body: (os) =>
      `इस डिवाइस में "मोशन कम करें" चालू है, इसलिए यह पेज जानबूझकर अपना शांत, स्थिर रूप दिखा रहा है — कोई 3D सीन, मैस्कट या स्क्रॉल एनिमेशन नहीं। अगर यह जानबूझकर नहीं किया गया था, तो इसे ${
        os === "windows"
          ? `Windows की एक्सेसिबिलिटी सेटिंग्स में "एनिमेशन इफ़ेक्ट्स" जैसे विकल्प से`
          : os === "mac"
            ? `अपने Mac की सिस्टम सेटिंग्स की एक्सेसिबिलिटी में "रिड्यूस मोशन" जैसे विकल्प से`
            : `डिवाइस की एक्सेसिबिलिटी या डिस्प्ले सेटिंग्स में "मोशन कम करें" जैसे विकल्प से`
      } वापस चालू करें, फिर इस पेज को रीलोड करें।`,
    dismiss: "यह सूचना बंद करें",
  },
  es: {
    body: (os) =>
      `Este dispositivo tiene el movimiento reducido activado, así que esta página muestra a propósito su versión estática y tranquila — sin escena 3D, sin mascota y sin animaciones al desplazarse. Si no fue intencional, puedes activarlo de nuevo en ${
        os === "windows"
          ? `los ajustes de accesibilidad de Windows, en algo como "efectos de animación"`
          : os === "mac"
            ? `los Ajustes del Sistema de tu Mac, en Accesibilidad, con algo como "reducir movimiento"`
            : `los ajustes de accesibilidad o pantalla de tu dispositivo, en algo como "reducir movimiento"`
      }, y luego recargar esta página para verlo.`,
    dismiss: "Cerrar este aviso",
  },
  fr: {
    body: (os) =>
      `Cet appareil a la réduction des animations activée, donc cette page affiche volontairement sa version calme et statique — pas de scène 3D, de mascotte ni d'animation au défilement. Si ce n'était pas voulu, vous pouvez la réactiver dans ${
        os === "windows"
          ? `les paramètres d'accessibilité de Windows, sous un intitulé du type « effets d'animation »`
          : os === "mac"
            ? `les Réglages Système de votre Mac, dans Accessibilité, sous un intitulé du type « réduire les animations »`
            : `les réglages d'accessibilité ou d'affichage de votre appareil, sous un intitulé du type « réduire les animations »`
      }, puis recharger cette page pour la voir.`,
    dismiss: "Fermer cet avis",
  },
  ar: {
    body: (os) =>
      `تم تفعيل خاصية "تقليل الحركة" على هذا الجهاز، لذلك تعرض هذه الصفحة عن قصد نسختها الهادئة والثابتة — بدون مشهد ثلاثي الأبعاد أو شخصية متحركة أو حركة عند التمرير. إذا لم يكن هذا مقصودًا، يمكنك إعادة تفعيلها من ${
        os === "windows"
          ? `إعدادات "سهولة الوصول" في Windows، ضمن خيار يشبه "تأثيرات الحركة"`
          : os === "mac"
            ? `إعدادات النظام على جهاز Mac، ضمن "سهولة الوصول"، في خيار يشبه "تقليل الحركة"`
            : `إعدادات سهولة الوصول أو العرض في جهازك، ضمن خيار يشبه "تقليل الحركة"`
      }، ثم إعادة تحميل هذه الصفحة لرؤيتها.`,
    dismiss: "إغلاق هذا التنبيه",
  },
  bn: {
    body: (os) =>
      `এই ডিভাইসে "রিডিউসড মোশন" চালু আছে, তাই এই পেজটি ইচ্ছাকৃতভাবে তার শান্ত, স্থির সংস্করণ দেখাচ্ছে — কোনো 3D দৃশ্য, মাসকট বা স্ক্রল অ্যানিমেশন নেই। যদি এটি ইচ্ছাকৃত না হয়ে থাকে, তাহলে ${
        os === "windows"
          ? `Windows-এর অ্যাক্সেসিবিলিটি সেটিংসে "অ্যানিমেশন ইফেক্ট"-এর মতো একটি অপশন থেকে`
          : os === "mac"
            ? `আপনার Mac-এর সিস্টেম সেটিংসের অ্যাক্সেসিবিলিটিতে "রিডিউস মোশন"-এর মতো একটি অপশন থেকে`
            : `ডিভাইসের অ্যাক্সেসিবিলিটি বা ডিসপ্লে সেটিংসে "রিডিউস মোশন"-এর মতো একটি অপশন থেকে`
      } এটি আবার চালু করতে পারেন, তারপর এই পেজটি রিলোড করুন।`,
    dismiss: "এই বার্তাটি বন্ধ করুন",
  },
  pt: {
    body: (os) =>
      `Este dispositivo está com a redução de movimento ativada, por isso esta página mostra de propósito a sua versão calma e estática — sem cena 3D, mascote ou animação ao rolar. Se isso não foi intencional, você pode reativá-la em ${
        os === "windows"
          ? `nas configurações de acessibilidade do Windows, em algo como "efeitos de animação"`
          : os === "mac"
            ? `nos Ajustes do Sistema do seu Mac, em Acessibilidade, em algo como "reduzir movimento"`
            : `nas configurações de acessibilidade ou tela do seu dispositivo, em algo como "reduzir movimento"`
      }, e depois recarregar esta página para ver.`,
    dismiss: "Fechar este aviso",
  },
  ru: {
    body: (os) =>
      `На этом устройстве включено уменьшение движения, поэтому страница намеренно показывает спокойную, статичную версию — без 3D-сцены, талисмана и анимации при прокрутке. Если это произошло случайно, включить обратно можно ${
        os === "windows"
          ? `в специальных возможностях Windows, в пункте вроде «эффекты анимации»`
          : os === "mac"
            ? `в системных настройках Mac, в разделе «Специальные возможности», в пункте вроде «уменьшение движения»`
            : `в настройках специальных возможностей или экрана устройства, в пункте вроде «уменьшение движения»`
      }, а затем перезагрузить эту страницу.`,
    dismiss: "Закрыть это уведомление",
  },
  ur: {
    body: (os) =>
      `اس ڈیوائس میں "حرکت میں کمی" فعال ہے، اس لیے یہ صفحہ جان بوجھ کر اپنا پرسکون، ساکت ورژن دکھا رہا ہے — نہ کوئی 3D منظر، نہ ساتھی کردار، نہ اسکرول اینیمیشن۔ اگر یہ ارادی نہیں تھا تو آپ اسے ${
        os === "windows"
          ? `Windows کی ایکسیسبیلیٹی سیٹنگز میں "اینیمیشن ایفیکٹس" جیسے آپشن سے`
          : os === "mac"
            ? `اپنے Mac کی سسٹم سیٹنگز کی ایکسیسبیلیٹی میں "ریڈیوس موشن" جیسے آپشن سے`
            : `ڈیوائس کی ایکسیسبیلیٹی یا ڈسپلے سیٹنگز میں "موشن کم کریں" جیسے آپشن سے`
      } دوبارہ فعال کر سکتے ہیں، پھر اس صفحے کو ری لوڈ کریں۔`,
    dismiss: "یہ اطلاع بند کریں",
  },
  id: {
    body: (os) =>
      `Perangkat ini mengaktifkan pengurangan gerakan, jadi halaman ini sengaja menampilkan versi statisnya yang tenang — tanpa adegan 3D, maskot, atau animasi saat menggulir. Jika ini tidak disengaja, kamu bisa mengaktifkannya lagi di ${
        os === "windows"
          ? `pengaturan aksesibilitas Windows, pada opsi seperti "efek animasi"`
          : os === "mac"
            ? `Pengaturan Sistem Mac kamu, di Aksesibilitas, pada opsi seperti "kurangi gerakan"`
            : `pengaturan aksesibilitas atau tampilan perangkat, pada opsi seperti "kurangi gerakan"`
      }, lalu muat ulang halaman ini untuk melihatnya.`,
    dismiss: "Tutup pemberitahuan ini",
  },
  de: {
    body: (os) =>
      `Auf diesem Gerät ist „Bewegung reduzieren" aktiviert, deshalb zeigt diese Seite absichtlich ihre ruhige, statische Version — keine 3D-Szene, kein Maskottchen, keine Scroll-Animation. Falls das nicht beabsichtigt war, kannst du es ${
        os === "windows"
          ? `in den Windows-Einstellungen unter „Erleichterte Bedienung", bei etwas wie „Animationseffekte"`
          : os === "mac"
            ? `in den Systemeinstellungen deines Mac unter „Bedienungshilfen", bei etwas wie „Bewegung reduzieren"`
            : `in den Bedienungshilfen- oder Anzeigeeinstellungen deines Geräts, bei etwas wie „Bewegung reduzieren"`
      } wieder aktivieren und diese Seite danach neu laden.`,
    dismiss: "Diesen Hinweis schließen",
  },
  ja: {
    body: (os) =>
      `このデバイスは「視差効果を減らす」がオンになっているため、このページはあえて落ち着いた静的なバージョンを表示しています——3Dシーンもマスコットもスクロールアニメーションもありません。意図的でない場合は、${
        os === "windows"
          ? `Windowsの「簡単操作」設定にある「アニメーション効果」のような項目から`
          : os === "mac"
            ? `Macの「システム設定」の「アクセシビリティ」にある「視差効果を減らす」のような項目から`
            : `端末のアクセシビリティまたは画面設定にある「視差効果を減らす」のような項目から`
      }再度オンにしてから、このページを再読み込みしてください。`,
    dismiss: "この通知を閉じる",
  },
  mr: {
    body: (os) =>
      `या डिव्हाइसवर "मोशन कमी करा" सुरू आहे, म्हणून हे पेज मुद्दाम त्याची शांत, स्थिर आवृत्ती दाखवत आहे — कोणतेही 3D दृश्य, मॅस्कॉट किंवा स्क्रोल अॅनिमेशन नाही. हे हेतुपुरस्सर नसेल, तर तुम्ही ते ${
        os === "windows"
          ? `Windows च्या अॅक्सेसिबिलिटी सेटिंग्जमध्ये "अॅनिमेशन इफेक्ट्स" सारख्या पर्यायावरून`
          : os === "mac"
            ? `तुमच्या Mac च्या सिस्टम सेटिंग्जमधील अॅक्सेसिबिलिटीमध्ये "रिड्यूस मोशन" सारख्या पर्यायावरून`
            : `डिव्हाइसच्या अॅक्सेसिबिलिटी किंवा डिस्प्ले सेटिंग्जमध्ये "मोशन कमी करा" सारख्या पर्यायावरून`
      } पुन्हा सुरू करू शकता, नंतर हे पेज रीलोड करा.`,
    dismiss: "ही सूचना बंद करा",
  },
  te: {
    body: (os) =>
      `ఈ పరికరంలో "మోషన్ తగ్గించు" ఆన్‌లో ఉంది, కాబట్టి ఈ పేజీ ఉద్దేశపూర్వకంగా దాని ప్రశాంతమైన, స్థిర వెర్షన్‌ను చూపిస్తోంది — 3D సన్నివేశం, మాస్కట్ లేదా స్క్రోల్ యానిమేషన్ లేకుండా. ఇది ఉద్దేశపూర్వకంగా చేయకపోతే, దీన్ని ${
        os === "windows"
          ? `Windows యాక్సెసిబిలిటీ సెట్టింగ్‌లలో "యానిమేషన్ ఎఫెక్ట్స్" వంటి ఆప్షన్ నుండి`
          : os === "mac"
            ? `మీ Mac సిస్టమ్ సెట్టింగ్‌ల యాక్సెసిబిలిటీలో "రిడ్యూస్ మోషన్" వంటి ఆప్షన్ నుండి`
            : `పరికరం యాక్సెసిబిలిటీ లేదా డిస్‌ప్లే సెట్టింగ్‌లలో "మోషన్ తగ్గించు" వంటి ఆప్షన్ నుండి`
      } మళ్లీ ఆన్ చేయవచ్చు, తర్వాత ఈ పేజీని రీలోడ్ చేయండి.`,
    dismiss: "ఈ నోటీసును మూసివేయండి",
  },
  tr: {
    body: (os) =>
      `Bu cihazda hareketi azalt açık olduğu için bu sayfa kasıtlı olarak sakin, sabit sürümünü gösteriyor — 3D sahne, maskot ya da kaydırma animasyonu yok. Bu kasıtlı değilse, ${
        os === "windows"
          ? `Windows erişilebilirlik ayarlarında "animasyon efektleri" gibi bir seçenekten`
          : os === "mac"
            ? `Mac'inizin Sistem Ayarları'ndaki Erişilebilirlik bölümünde "hareketi azalt" gibi bir seçenekten`
            : `cihazınızın erişilebilirlik veya ekran ayarlarında "hareketi azalt" gibi bir seçenekten`
      } yeniden açabilir, ardından bu sayfayı yenileyebilirsiniz.`,
    dismiss: "Bu bildirimi kapat",
  },
  ta: {
    body: (os) =>
      `இந்தச் சாதனத்தில் "இயக்கத்தைக் குறை" இயக்கத்தில் உள்ளது, எனவே இந்தப் பக்கம் வேண்டுமென்றே அதன் அமைதியான, நிலையான பதிப்பைக் காட்டுகிறது — 3D காட்சி, சின்னம் அல்லது ஸ்க்ரோல் அனிமேஷன் இல்லை. இது வேண்டுமென்றே செய்யப்படவில்லை என்றால், இதை ${
        os === "windows"
          ? `Windows அணுகல்தன்மை அமைப்புகளில் "அனிமேஷன் விளைவுகள்" போன்ற விருப்பத்திலிருந்து`
          : os === "mac"
            ? `உங்கள் Mac சிஸ்டம் அமைப்புகளின் அணுகல்தன்மையில் "இயக்கத்தைக் குறை" போன்ற விருப்பத்திலிருந்து`
            : `சாதனத்தின் அணுகல்தன்மை அல்லது காட்சி அமைப்புகளில் "இயக்கத்தைக் குறை" போன்ற விருப்பத்திலிருந்து`
      } மீண்டும் இயக்கலாம், பிறகு இந்தப் பக்கத்தை மீண்டும் ஏற்றவும்.`,
    dismiss: "இந்த அறிவிப்பை மூடு",
  },
  vi: {
    body: (os) =>
      `Thiết bị này đang bật chế độ giảm chuyển động, nên trang này cố ý hiển thị phiên bản tĩnh, nhẹ nhàng của nó — không có cảnh 3D, linh vật hay hiệu ứng cuộn. Nếu bạn không cố ý bật chế độ này, bạn có thể bật lại nó trong ${
        os === "windows"
          ? `cài đặt trợ năng của Windows, ở mục tương tự "hiệu ứng chuyển động"`
          : os === "mac"
            ? `Cài đặt Hệ thống trên Mac, trong mục Trợ năng, ở tùy chọn tương tự "giảm chuyển động"`
            : `cài đặt trợ năng hoặc màn hình của thiết bị, ở mục tương tự "giảm chuyển động"`
      }, rồi tải lại trang này để xem.`,
    dismiss: "Đóng thông báo này",
  },
  ko: {
    body: (os) =>
      `이 기기는 "동작 줄이기"가 켜져 있어서, 이 페이지는 일부러 차분하고 정적인 버전을 보여주고 있습니다 — 3D 장면도, 마스코트도, 스크롤 애니메이션도 없습니다. 의도한 것이 아니라면 ${
        os === "windows"
          ? `Windows의 접근성 설정에서 "애니메이션 효과"와 비슷한 항목을`
          : os === "mac"
            ? `Mac의 시스템 설정 접근성에서 "동작 줄이기"와 비슷한 항목을`
            : `기기의 접근성 또는 디스플레이 설정에서 "동작 줄이기"와 비슷한 항목을`
      } 다시 켠 다음, 이 페이지를 새로고침하면 됩니다.`,
    dismiss: "이 알림 닫기",
  },
  it: {
    body: (os) =>
      `Questo dispositivo ha la riduzione del movimento attivata, quindi questa pagina mostra di proposito la sua versione statica e tranquilla — niente scena 3D, mascotte o animazioni durante lo scroll. Se non era intenzionale, puoi riattivarla ${
        os === "windows"
          ? `nelle impostazioni di accessibilità di Windows, in una voce simile a "effetti di animazione"`
          : os === "mac"
            ? `nelle Impostazioni di Sistema del tuo Mac, sotto Accessibilità, in una voce simile a "riduci movimento"`
            : `nelle impostazioni di accessibilità o schermo del tuo dispositivo, in una voce simile a "riduci movimento"`
      }, e poi ricaricare questa pagina per vederla.`,
    dismiss: "Chiudi questo avviso",
  },
  pl: {
    body: (os) =>
      `To urządzenie ma włączone ograniczenie ruchu, więc ta strona celowo pokazuje swoją spokojną, statyczną wersję — bez sceny 3D, maskotki czy animacji przy przewijaniu. Jeśli to nie było zamierzone, możesz włączyć to ponownie ${
        os === "windows"
          ? `w ustawieniach ułatwień dostępu Windows, w pozycji podobnej do "efekty animacji"`
          : os === "mac"
            ? `w Ustawieniach systemowych Maca, w Ułatwieniach dostępu, w pozycji podobnej do "ogranicz ruch"`
            : `w ustawieniach ułatwień dostępu lub ekranu urządzenia, w pozycji podobnej do "ogranicz ruch"`
      }, a następnie odświeżyć tę stronę, aby to zobaczyć.`,
    dismiss: "Zamknij to powiadomienie",
  },
  uk: {
    body: (os) =>
      `На цьому пристрої увімкнено зменшення руху, тому ця сторінка навмисно показує спокійну, статичну версію — без 3D-сцени, талісмана чи анімації прокручування. Якщо це сталося не навмисно, увімкнути назад можна ${
        os === "windows"
          ? `у спеціальних можливостях Windows, у пункті на кшталт «ефекти анімації»`
          : os === "mac"
            ? `у системних налаштуваннях Mac, у розділі «Спеціальні можливості», у пункті на кшталт «зменшення руху»`
            : `у налаштуваннях спеціальних можливостей або екрана пристрою, у пункті на кшталт «зменшення руху»`
      }, а потім перезавантажити цю сторінку.`,
    dismiss: "Закрити це повідомлення",
  },
  ro: {
    body: (os) =>
      `Acest dispozitiv are mișcarea redusă activată, așa că această pagină își arată intenționat versiunea calmă și statică — fără scenă 3D, mascotă sau animații la derulare. Dacă nu a fost intenționat, o poți reactiva din ${
        os === "windows"
          ? `setările de accesibilitate din Windows, la o opțiune de tipul "efecte de animație"`
          : os === "mac"
            ? `Setările de sistem ale Mac-ului tău, la Accesibilitate, la o opțiune de tipul "reduce mișcarea"`
            : `setările de accesibilitate sau de afișare ale dispozitivului, la o opțiune de tipul "reduce mișcarea"`
      }, apoi reîncarcă această pagină ca s-o vezi.`,
    dismiss: "Închide acest mesaj",
  },
  nl: {
    body: (os) =>
      `Dit apparaat heeft beweging verminderen ingeschakeld, dus deze pagina laat expres zijn rustige, statische versie zien — geen 3D-scène, mascotte of scroll-animatie. Als dat niet de bedoeling was, kun je het weer aanzetten ${
        os === "windows"
          ? `in de toegankelijkheidsinstellingen van Windows, bij iets als "animatie-effecten"`
          : os === "mac"
            ? `in de Systeeminstellingen van je Mac, bij Toegankelijkheid, bij iets als "beweging verminderen"`
            : `in de toegankelijkheids- of scherminstellingen van je apparaat, bij iets als "beweging verminderen"`
      }, en deze pagina daarna herladen om het te zien.`,
    dismiss: "Deze melding sluiten",
  },
  th: {
    body: (os) =>
      `อุปกรณ์นี้เปิดใช้งาน "ลดการเคลื่อนไหว" อยู่ หน้านี้จึงตั้งใจแสดงเวอร์ชันนิ่งและสงบของมัน — ไม่มีฉาก 3 มิติ มาสคอต หรือแอนิเมชันตอนเลื่อนหน้าจอ หากไม่ได้ตั้งใจ คุณสามารถเปิดกลับมาได้ที่${
        os === "windows"
          ? `การตั้งค่าการช่วยการเข้าถึงของ Windows ในตัวเลือกที่คล้ายกับ "เอฟเฟกต์ภาพเคลื่อนไหว"`
          : os === "mac"
            ? `การตั้งค่าระบบของ Mac ในหมวดการช่วยการเข้าถึง ที่ตัวเลือกคล้ายกับ "ลดการเคลื่อนไหว"`
            : `การตั้งค่าการช่วยการเข้าถึงหรือหน้าจอของอุปกรณ์ ที่ตัวเลือกคล้ายกับ "ลดการเคลื่อนไหว"`
      } แล้วโหลดหน้านี้ใหม่เพื่อดูผล`,
    dismiss: "ปิดการแจ้งเตือนนี้",
  },
  gu: {
    body: (os) =>
      `આ ડિવાઇસમાં "મોશન ઘટાડો" ચાલુ છે, તેથી આ પેજ જાણીજોઈને તેની શાંત, સ્થિર આવૃત્તિ બતાવી રહ્યું છે — કોઈ 3D દ્રશ્ય, મેસ્કોટ કે સ્ક્રોલ એનિમેશન નથી. જો આ ઇરાદાપૂર્વક ન હોય, તો તમે તેને ${
        os === "windows"
          ? `Windows ની ઍક્સેસિબિલિટી સેટિંગ્સમાં "એનિમેશન ઇફેક્ટ્સ" જેવા વિકલ્પથી`
          : os === "mac"
            ? `તમારા Mac ની સિસ્ટમ સેટિંગ્સની ઍક્સેસિબિલિટીમાં "રિડ્યુસ મોશન" જેવા વિકલ્પથી`
            : `ડિવાઇસની ઍક્સેસિબિલિટી કે ડિસ્પ્લે સેટિંગ્સમાં "મોશન ઘટાડો" જેવા વિકલ્પથી`
      } ફરીથી ચાલુ કરી શકો છો, પછી આ પેજ ફરીથી લોડ કરો.`,
    dismiss: "આ સૂચના બંધ કરો",
  },
  fa: {
    body: (os) =>
      `در این دستگاه گزینه "کاهش حرکت" روشن است، به همین دلیل این صفحه عمداً نسخه آرام و ثابت خود را نشان می‌دهد — بدون صحنه سه‌بعدی، شخصیت همراه یا انیمیشن اسکرول. اگر این کار عمدی نبوده، می‌توانید آن را ${
        os === "windows"
          ? `از تنظیمات دسترس‌پذیری ویندوز، در گزینه‌ای شبیه "جلوه‌های متحرک"`
          : os === "mac"
            ? `از تنظیمات سیستم مک، در بخش دسترس‌پذیری، در گزینه‌ای شبیه "کاهش حرکت"`
            : `از تنظیمات دسترس‌پذیری یا نمایشگر دستگاه، در گزینه‌ای شبیه "کاهش حرکت"`
      } دوباره روشن کنید، سپس این صفحه را دوباره بارگذاری کنید.`,
    dismiss: "بستن این اعلان",
  },
  pa: {
    body: (os) =>
      `ਇਸ ਡਿਵਾਈਸ ਵਿੱਚ "ਮੋਸ਼ਨ ਘਟਾਓ" ਚਾਲੂ ਹੈ, ਇਸ ਲਈ ਇਹ ਪੇਜ ਜਾਣਬੁੱਝ ਕੇ ਆਪਣਾ ਸ਼ਾਂਤ, ਸਥਿਰ ਰੂਪ ਦਿਖਾ ਰਿਹਾ ਹੈ — ਕੋਈ 3D ਦ੍ਰਿਸ਼, ਮੈਸਕਟ ਜਾਂ ਸਕ੍ਰੌਲ ਐਨੀਮੇਸ਼ਨ ਨਹੀਂ। ਜੇ ਇਹ ਜਾਣਬੁੱਝ ਕੇ ਨਹੀਂ ਸੀ, ਤਾਂ ਤੁਸੀਂ ਇਸਨੂੰ ${
        os === "windows"
          ? `Windows ਦੀਆਂ ਐਕਸੈਸਬਿਲਟੀ ਸੈਟਿੰਗਾਂ ਵਿੱਚ "ਐਨੀਮੇਸ਼ਨ ਇਫੈਕਟਸ" ਵਰਗੇ ਵਿਕਲਪ ਤੋਂ`
          : os === "mac"
            ? `ਆਪਣੇ Mac ਦੀਆਂ ਸਿਸਟਮ ਸੈਟਿੰਗਾਂ ਦੀ ਐਕਸੈਸਬਿਲਟੀ ਵਿੱਚ "ਰਿਡਿਊਸ ਮੋਸ਼ਨ" ਵਰਗੇ ਵਿਕਲਪ ਤੋਂ`
            : `ਡਿਵਾਈਸ ਦੀਆਂ ਐਕਸੈਸਬਿਲਟੀ ਜਾਂ ਡਿਸਪਲੇ ਸੈਟਿੰਗਾਂ ਵਿੱਚ "ਮੋਸ਼ਨ ਘਟਾਓ" ਵਰਗੇ ਵਿਕਲਪ ਤੋਂ`
      } ਦੁਬਾਰਾ ਚਾਲੂ ਕਰ ਸਕਦੇ ਹੋ, ਫਿਰ ਇਸ ਪੇਜ ਨੂੰ ਰੀਲੋਡ ਕਰੋ।`,
    dismiss: "ਇਹ ਸੂਚਨਾ ਬੰਦ ਕਰੋ",
  },
  sw: {
    body: (os) =>
      `Kifaa hiki kimewasha kupunguza mwendo, hivyo ukurasa huu unaonyesha kwa makusudi toleo lake tulivu, tuli — hakuna mandhari ya 3D, mnyama-alama, wala uhuishaji wa kusogeza. Kama hukukusudia hili, unaweza kukiwasha tena kwenye ${
        os === "windows"
          ? `mipangilio ya ufikivu ya Windows, kwenye chaguo linalofanana na "athari za uhuishaji"`
          : os === "mac"
            ? `Mipangilio ya Mfumo ya Mac yako, chini ya Ufikivu, kwenye chaguo linalofanana na "punguza mwendo"`
            : `mipangilio ya ufikivu au onyesho la kifaa chako, kwenye chaguo linalofanana na "punguza mwendo"`
      }, kisha upakie upya ukurasa huu ili kuiona.`,
    dismiss: "Funga arifa hii",
  },
  ha: {
    body: (os) =>
      `Na'urar nan tana da rage motsi a kunne, don haka wannan shafin da gangan yana nuna sigar sa mai natsuwa, wadda ba ta motsi — babu wani yanayin 3D, mascot, ko motsi na gungurawa. Idan ba a yi wannan da gangan ba, za ka iya sake kunna shi a ${
        os === "windows"
          ? `cikin saitunan samun dama na Windows, a wani zaɓi kamar "tasirin motsi"`
          : os === "mac"
            ? `Saitunan Tsarin Mac ɗinka, ƙarƙashin Samun Dama, a wani zaɓi kamar "rage motsi"`
            : `saitunan samun dama ko na allo na na'urarka, a wani zaɓi kamar "rage motsi"`
      }, sannan ka sake loda wannan shafin don ganin sa.`,
    dismiss: "Rufe wannan sanarwa",
  },
  kn: {
    body: (os) =>
      `ಈ ಸಾಧನದಲ್ಲಿ "ಚಲನೆ ಕಡಿಮೆ ಮಾಡು" ಆನ್ ಆಗಿದೆ, ಆದ್ದರಿಂದ ಈ ಪುಟವು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ತನ್ನ ಶಾಂತ, ಸ್ಥಿರ ಆವೃತ್ತಿಯನ್ನು ತೋರಿಸುತ್ತಿದೆ — ಯಾವುದೇ 3D ದೃಶ್ಯ, ಮ್ಯಾಸ್ಕಟ್ ಅಥವಾ ಸ್ಕ್ರಾಲ್ ಅನಿಮೇಷನ್ ಇಲ್ಲ. ಇದು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ಆಗಿಲ್ಲದಿದ್ದರೆ, ಇದನ್ನು ${
        os === "windows"
          ? `Windows ಆಕ್ಸೆಸಿಬಿಲಿಟಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ "ಅನಿಮೇಷನ್ ಎಫೆಕ್ಟ್ಸ್" ನಂತಹ ಆಯ್ಕೆಯಿಂದ`
          : os === "mac"
            ? `ನಿಮ್ಮ Mac ಸಿಸ್ಟಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳ ಆಕ್ಸೆಸಿಬಿಲಿಟಿಯಲ್ಲಿ "ರಿಡ್ಯೂಸ್ ಮೋಷನ್" ನಂತಹ ಆಯ್ಕೆಯಿಂದ`
            : `ಸಾಧನದ ಆಕ್ಸೆಸಿಬಿಲಿಟಿ ಅಥವಾ ಡಿಸ್‌ಪ್ಲೇ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ "ಚಲನೆ ಕಡಿಮೆ ಮಾಡು" ನಂತಹ ಆಯ್ಕೆಯಿಂದ`
      } ಮತ್ತೆ ಆನ್ ಮಾಡಬಹುದು, ನಂತರ ಈ ಪುಟವನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ.`,
    dismiss: "ಈ ಸೂಚನೆಯನ್ನು ಮುಚ್ಚಿ",
  },
  ml: {
    body: (os) =>
      `ഈ ഉപകരണത്തിൽ "ചലനം കുറയ്ക്കുക" ഓണാണ്, അതിനാൽ ഈ പേജ് മനഃപൂർവ്വം അതിന്റെ ശാന്തമായ, സ്ഥിര പതിപ്പ് കാണിക്കുന്നു — 3D രംഗമോ മാസ്കോട്ടോ സ്ക്രോൾ ആനിമേഷനോ ഇല്ല. ഇത് മനഃപൂർവ്വമല്ലെങ്കിൽ, ഇത് ${
        os === "windows"
          ? `Windows-ന്റെ ആക്സസിബിലിറ്റി സെറ്റിംഗ്സിൽ "ആനിമേഷൻ ഇഫക്ട്സ്" പോലുള്ള ഓപ്ഷനിൽ നിന്ന്`
          : os === "mac"
            ? `നിങ്ങളുടെ Mac-ന്റെ സിസ്റ്റം സെറ്റിംഗ്സിലെ ആക്സസിബിലിറ്റിയിൽ "റിഡ്യൂസ് മോഷൻ" പോലുള്ള ഓപ്ഷനിൽ നിന്ന്`
            : `ഉപകരണത്തിന്റെ ആക്സസിബിലിറ്റി അല്ലെങ്കിൽ ഡിസ്‌പ്ലേ സെറ്റിംഗ്സിൽ "ചലനം കുറയ്ക്കുക" പോലുള്ള ഓപ്ഷനിൽ നിന്ന്`
      } വീണ്ടും ഓണാക്കാം, എന്നിട്ട് ഈ പേജ് വീണ്ടും ലോഡ് ചെയ്യുക.`,
    dismiss: "ഈ അറിയിപ്പ് അടയ്ക്കുക",
  },
  my: {
    body: (os) =>
      `ဒီစက်ပစ္စည်းမှာ "လှုပ်ရှားမှုလျှော့ချရန်" ဖွင့်ထားလို့၊ ဒီစာမျက်နှာက တမင်တကာ ၎င်း၏ တည်ငြိမ်တဲ့ ဗားရှင်းကို ပြသနေပါတယ် — 3D မြင်ကွင်း၊ mascot ဒါမှမဟုတ် scroll animation မပါဘူး။ ဒါကို တမင်မလုပ်ခဲ့ဘူးဆိုရင်၊ ${
        os === "windows"
          ? `Windows ၏ အများသုံးနိုင်မှု ဆက်တင်များထဲက "animation effects" နဲ့ဆင်တူတဲ့ ရွေးချယ်စရာကနေ`
          : os === "mac"
            ? `သင့် Mac ၏ System Settings ရှိ Accessibility ထဲက "reduce motion" နဲ့ဆင်တူတဲ့ ရွေးချယ်စရာကနေ`
            : `စက်ပစ္စည်း၏ accessibility သို့မဟုတ် display ဆက်တင်များထဲက "လှုပ်ရှားမှုလျှော့ချရန်" နဲ့ဆင်တူတဲ့ ရွေးချယ်စရာကနေ`
      } ပြန်ဖွင့်နိုင်ပြီး၊ ပြီးရင် ဒီစာမျက်နှာကို ပြန်ဖွင့်ပါ။`,
    dismiss: "ဒီအသိပေးချက်ကို ပိတ်ရန်",
  },
  am: {
    body: (os) =>
      `ይህ መሣሪያ እንቅስቃሴን መቀነስ በርቷል፣ ስለዚህ ይህ ገጽ ሆን ብሎ ጸጥ ያለ፣ የማይንቀሳቀስ ስሪቱን እያሳየ ነው — ምንም 3D ትዕይንት፣ ማስኮት ወይም የመሸብለያ እንቅስቃሴ የለም። ይህ ሆን ተብሎ ካልነበረ፣ ${
        os === "windows"
          ? `በWindows የተደራሽነት ቅንብሮች ውስጥ "የእንቅስቃሴ ውጤቶች" በሚመስል አማራጭ`
          : os === "mac"
            ? `በእርስዎ Mac የስርዓት ቅንብሮች ውስጥ ተደራሽነት ስር "እንቅስቃሴን ቀንስ" በሚመስል አማራጭ`
            : `በመሣሪያዎ ተደራሽነት ወይም ማሳያ ቅንብሮች ውስጥ "እንቅስቃሴን ቀንስ" በሚመስል አማራጭ`
      } እንደገና ማብራት ይችላሉ፣ ከዚያ ይህን ገጽ እንደገና ይጫኑት።`,
    dismiss: "ይህን ማሳወቂያ ዝጋ",
  },
  az: {
    body: (os) =>
      `Bu cihazda hərəkəti azalt aktivdir, ona görə bu səhifə qəsdən öz sakit, statik versiyasını göstərir — 3D səhnə, maskot və ya sürüşdürmə animasiyası yoxdur. Bu qəsdən edilməyibsə, onu ${
        os === "windows"
          ? `Windows-un əlçatanlıq ayarlarında "animasiya effektləri" kimi bir seçimdən`
          : os === "mac"
            ? `Mac-inizin Sistem Ayarlarında, Əlçatanlıq bölməsində "hərəkəti azalt" kimi bir seçimdən`
            : `cihazınızın əlçatanlıq və ya ekran ayarlarında "hərəkəti azalt" kimi bir seçimdən`
      } yenidən aça bilərsiniz, sonra bu səhifəni yeniləyin.`,
    dismiss: "Bu bildirişi bağla",
  },
  or: {
    body: (os) =>
      `ଏହି ଡିଭାଇସ୍‌ରେ "ଗତି କମାନ୍ତୁ" ଅନ୍ ଅଛି, ତେଣୁ ଏହି ପୃଷ୍ଠା ଇଚ୍ଛାକୃତ ଭାବେ ତାହାର ଶାନ୍ତ, ସ୍ଥିର ସଂସ୍କରଣ ଦେଖାଉଛି — କୌଣସି 3D ଦୃଶ୍ୟ, ମାସକଟ୍ କିମ୍ବା ସ୍କ୍ରୋଲ୍ ଆନିମେସନ୍ ନାହିଁ। ଏହା ଇଚ୍ଛାକୃତ ନ ଥିଲେ, ଆପଣ ଏହାକୁ ${
        os === "windows"
          ? `Windows ର ଆକ୍ସେସିବିଲିଟି ସେଟିଂସରେ "ଆନିମେସନ୍ ଇଫେକ୍ଟସ୍" ପରି ଏକ ବିକଳ୍ପରୁ`
          : os === "mac"
            ? `ଆପଣଙ୍କ Mac ର ସିଷ୍ଟମ୍ ସେଟିଂସର ଆକ୍ସେସିବିଲିଟିରେ "ରିଡ୍ୟୁସ୍ ମୋସନ୍" ପରି ଏକ ବିକଳ୍ପରୁ`
            : `ଡିଭାଇସ୍‌ର ଆକ୍ସେସିବିଲିଟି କିମ୍ବା ଡିସପ୍ଲେ ସେଟିଂସରେ "ଗତି କମାନ୍ତୁ" ପରି ଏକ ବିକଳ୍ପରୁ`
      } ପୁଣି ଅନ୍ କରିପାରିବେ, ତା'ପରେ ଏହି ପୃଷ୍ଠାକୁ ପୁଣି ଲୋଡ୍ କରନ୍ତୁ।`,
    dismiss: "ଏହି ବିଜ୍ଞପ୍ତି ବନ୍ଦ କରନ୍ତୁ",
  },
  he: {
    body: (os) =>
      `במכשיר הזה מופעלת הפחתת תנועה, ולכן הדף הזה מציג בכוונה את הגרסה השקטה והסטטית שלו — בלי סצנת תלת-ממד, קמע או אנימציית גלילה. אם זה לא היה מכוון, אפשר להפעיל את זה מחדש ${
        os === "windows"
          ? `בהגדרות הנגישות של Windows, באפשרות בסגנון "אפקטי אנימציה"`
          : os === "mac"
            ? `בהגדרות המערכת של ה-Mac, תחת נגישות, באפשרות בסגנון "הפחתת תנועה"`
            : `בהגדרות הנגישות או התצוגה של המכשיר, באפשרות בסגנון "הפחתת תנועה"`
      }, ואז לרענן את הדף כדי לראות את זה.`,
    dismiss: "סגירת ההודעה הזו",
  },
  el: {
    body: (os) =>
      `Αυτή η συσκευή έχει ενεργοποιημένη τη μείωση κίνησης, γι' αυτό η σελίδα εμφανίζει σκόπιμα την ήρεμη, στατική της έκδοση — χωρίς 3D σκηνή, μασκότ ή κίνηση κατά την κύλιση. Αν αυτό δεν ήταν σκόπιμο, μπορείτε να το ενεργοποιήσετε ξανά ${
        os === "windows"
          ? `στις ρυθμίσεις προσβασιμότητας των Windows, σε μια επιλογή όπως «εφέ κίνησης»`
          : os === "mac"
            ? `στις Ρυθμίσεις Συστήματος του Mac σας, στην Προσβασιμότητα, σε μια επιλογή όπως «μείωση κίνησης»`
            : `στις ρυθμίσεις προσβασιμότητας ή οθόνης της συσκευής σας, σε μια επιλογή όπως «μείωση κίνησης»`
      }, και μετά να ανανεώσετε τη σελίδα για να το δείτε.`,
    dismiss: "Κλείσιμο αυτής της ειδοποίησης",
  },
  cs: {
    body: (os) =>
      `Toto zařízení má zapnuté omezení pohybu, proto tato stránka záměrně zobrazuje svou klidnou, statickou verzi — bez 3D scény, maskota nebo animace při posouvání. Pokud to nebylo záměrné, můžete to znovu zapnout ${
        os === "windows"
          ? `v nastavení usnadnění přístupu Windows, v položce podobné „efekty animace"`
          : os === "mac"
            ? `v Nastavení systému vašeho Macu, v části Usnadnění, v položce podobné „omezit pohyb"`
            : `v nastavení usnadnění nebo displeje vašeho zařízení, v položce podobné „omezit pohyb"`
      }, a poté tuto stránku znovu načíst, abyste to viděli.`,
    dismiss: "Zavřít toto oznámení",
  },
  sv: {
    body: (os) =>
      `Den här enheten har minska rörelse aktiverat, så den här sidan visar medvetet sin lugna, statiska version — ingen 3D-scen, maskot eller rullningsanimation. Om det inte var avsiktligt kan du slå på det igen ${
        os === "windows"
          ? `i Windows tillgänglighetsinställningar, under något i stil med "animationseffekter"`
          : os === "mac"
            ? `i din Mac:s Systeminställningar, under Tillgänglighet, i något i stil med "minska rörelse"`
            : `i enhetens tillgänglighets- eller skärminställningar, i något i stil med "minska rörelse"`
      }, och sedan ladda om sidan för att se det.`,
    dismiss: "Stäng den här notisen",
  },
  hu: {
    body: (os) =>
      `Ezen az eszközön be van kapcsolva a mozgás csökkentése, ezért ez az oldal szándékosan a nyugodt, statikus verzióját mutatja — nincs 3D-jelenet, kabalafigura vagy görgetési animáció. Ha ez nem szándékosan történt, újra bekapcsolhatod ${
        os === "windows"
          ? `a Windows kisegítő lehetőségek beállításaiban, egy "animációs effektek"-hez hasonló opciónál`
          : os === "mac"
            ? `a Mac Rendszerbeállításaiban, a Kisegítő lehetőségeknél, egy "mozgás csökkentése"-hez hasonló opciónál`
            : `az eszköz kisegítő lehetőségek vagy kijelző beállításaiban, egy "mozgás csökkentése"-hez hasonló opciónál`
      }, majd töltsd újra ezt az oldalt, hogy lásd.`,
    dismiss: "Értesítés bezárása",
  },
  fi: {
    body: (os) =>
      `Tässä laitteessa on liikkeen vähentäminen käytössä, joten tämä sivu näyttää tarkoituksella rauhallisen, staattisen versionsa — ei 3D-kohtausta, maskottia tai vieritysanimaatiota. Jos tämä ei ollut tarkoituksellista, voit ottaa sen uudelleen käyttöön ${
        os === "windows"
          ? `Windowsin helppokäyttöasetuksista, kohdasta kuten "animaatiotehosteet"`
          : os === "mac"
            ? `Macin Järjestelmäasetuksista, kohdasta Helppokäyttötoiminnot, kohdasta kuten "vähennä liikettä"`
            : `laitteesi helppokäyttö- tai näyttöasetuksista, kohdasta kuten "vähennä liikettä"`
      }, ja ladata tämän sivun sitten uudelleen nähdäksesi sen.`,
    dismiss: "Sulje tämä ilmoitus",
  },
  da: {
    body: (os) =>
      `Denne enhed har reducer bevægelse slået til, så denne side viser bevidst sin rolige, statiske version — ingen 3D-scene, maskot eller scroll-animation. Hvis det ikke var med vilje, kan du slå det til igen ${
        os === "windows"
          ? `i Windows' indstillinger for tilgængelighed, under noget i stil med "animationseffekter"`
          : os === "mac"
            ? `i din Macs Systemindstillinger, under Tilgængelighed, ved noget i stil med "reducér bevægelse"`
            : `i enhedens indstillinger for tilgængelighed eller skærm, ved noget i stil med "reducér bevægelse"`
      }, og derefter genindlæse denne side for at se det.`,
    dismiss: "Luk denne meddelelse",
  },
  no: {
    body: (os) =>
      `Denne enheten har redusert bevegelse slått på, så denne siden viser bevisst sin rolige, statiske versjon — ingen 3D-scene, maskot eller rulleanimasjon. Hvis dette ikke var meningen, kan du slå det på igjen ${
        os === "windows"
          ? `i Windows' innstillinger for tilgjengelighet, under noe som "animasjonseffekter"`
          : os === "mac"
            ? `i Systeminnstillinger på Mac-en din, under Tilgjengelighet, ved noe som "reduser bevegelse"`
            : `i enhetens innstillinger for tilgjengelighet eller skjerm, ved noe som "reduser bevegelse"`
      }, og deretter laste denne siden på nytt for å se det.`,
    dismiss: "Lukk dette varselet",
  },
  sk: {
    body: (os) =>
      `Toto zariadenie má zapnuté obmedzenie pohybu, preto táto stránka zámerne zobrazuje svoju pokojnú, statickú verziu — bez 3D scény, maskota alebo animácie pri posúvaní. Ak to nebolo zámerné, môžete to znova zapnúť ${
        os === "windows"
          ? `v nastaveniach zjednodušenia ovládania Windows, v položke podobnej „efekty animácie"`
          : os === "mac"
            ? `v Nastaveniach systému vášho Macu, v časti Zjednodušenie ovládania, v položke podobnej „obmedziť pohyb"`
            : `v nastaveniach zjednodušenia ovládania alebo displeja zariadenia, v položke podobnej „obmedziť pohyb"`
      }, a potom túto stránku znova načítať, aby ste to videli.`,
    dismiss: "Zavrieť toto oznámenie",
  },
  bg: {
    body: (os) =>
      `Това устройство има включено намаляване на движението, затова тази страница нарочно показва спокойната си, статична версия — без 3D сцена, талисман или анимация при превъртане. Ако това не е било нарочно, можете да го включите отново ${
        os === "windows"
          ? `в настройките за достъпност на Windows, в опция, подобна на „ефекти на анимация"`
          : os === "mac"
            ? `в системните настройки на вашия Mac, в Достъпност, в опция, подобна на „намаляване на движението"`
            : `в настройките за достъпност или дисплей на устройството, в опция, подобна на „намаляване на движението"`
      }, а след това презаредете тази страница, за да го видите.`,
    dismiss: "Затвори това известие",
  },
  hr: {
    body: (os) =>
      `Ovaj uređaj ima uključeno smanjenje pokreta, pa ova stranica namjerno prikazuje svoju mirnu, statičnu verziju — bez 3D prizora, maskote ili animacije pri pomicanju. Ako to nije bilo namjerno, možete to ponovno uključiti ${
        os === "windows"
          ? `u postavkama pristupačnosti sustava Windows, u stavci sličnoj "efekti animacije"`
          : os === "mac"
            ? `u Postavkama sustava svog Maca, pod Pristupačnost, u stavci sličnoj "smanji pokret"`
            : `u postavkama pristupačnosti ili zaslona uređaja, u stavci sličnoj "smanji pokret"`
      }, a zatim ponovno učitati ovu stranicu da to vidite.`,
    dismiss: "Zatvori ovu obavijest",
  },
  ms: {
    body: (os) =>
      `Peranti ini mempunyai kurangkan gerakan diaktifkan, jadi halaman ini sengaja menunjukkan versi statiknya yang tenang — tiada adegan 3D, maskot, atau animasi tatal. Jika ini tidak disengajakan, anda boleh menghidupkannya semula ${
        os === "windows"
          ? `dalam tetapan kebolehcapaian Windows, pada pilihan seperti "kesan animasi"`
          : os === "mac"
            ? `dalam Tetapan Sistem Mac anda, di bawah Kebolehcapaian, pada pilihan seperti "kurangkan gerakan"`
            : `dalam tetapan kebolehcapaian atau paparan peranti anda, pada pilihan seperti "kurangkan gerakan"`
      }, kemudian muat semula halaman ini untuk melihatnya.`,
    dismiss: "Tutup pemberitahuan ini",
  },
  fil: {
    body: (os) =>
      `Naka-on ang reduced motion sa device na ito, kaya sinasadyang ipinapakita ng pahinang ito ang kalmado, static nitong bersyon — walang 3D scene, mascot, o scroll animation. Kung hindi ito sinasadya, puwede mo itong i-on ulit sa ${
        os === "windows"
          ? `accessibility settings ng Windows, sa opsyon na katulad ng "animation effects"`
          : os === "mac"
            ? `System Settings ng iyong Mac, sa ilalim ng Accessibility, sa opsyon na katulad ng "reduce motion"`
            : `accessibility o display settings ng iyong device, sa opsyon na katulad ng "reduce motion"`
      }, pagkatapos i-reload ang pahinang ito para makita ito.`,
    dismiss: "Isara ang paunawang ito",
  },
};

/** Reads navigator.language(s), normalises a BCP-47 tag to the subtag this
    table actually keys on, and falls back to English for anything
    unsupported (or when navigator isn't available at all, e.g. during SSR).
    No preference is ever persisted here — this runs fresh on every visit,
    same as prefers-reduced-motion itself, by design (see the "NOT a manual
    switcher" note on the component). */
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";

  const candidates = navigator.languages?.length
    ? navigator.languages
    : navigator.language
      ? [navigator.language]
      : [];

  for (const raw of candidates) {
    const tag = raw.toLowerCase();

    /* Chinese is the one language in this table that isn't just a bare
       primary subtag — script/region decide Simplified vs Traditional, and
       a bare "zh" defaults to Simplified since that's the larger population. */
    if (tag.startsWith("zh")) {
      if (tag.includes("hant") || tag.includes("-tw") || tag.includes("-hk") || tag.includes("-mo")) {
        return "zh-Hant";
      }
      return "zh-Hans";
    }

    const primary = tag.split("-")[0] as Lang;
    if (primary in COPY) return primary;
  }

  return "en";
}
