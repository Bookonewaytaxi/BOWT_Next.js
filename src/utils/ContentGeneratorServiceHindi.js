// Utility to generate comprehensive Hindi route content and validate keyword usage

export const generateRouteContentHindi = (route, keywords = []) => {
  const {
    from_city,
    to_city,
    distance_km,
    sedan_price,
    ertiga_price,
    carens_price,
    innova_crysta_price
  } = route;

  const distance = distance_km || '0';
  const duration = calculateDuration(distance);
  const basePrice = sedan_price || 0;

  const sections = [
    generateRouteOverviewHindi(from_city, to_city, distance, duration, basePrice),
    generateAboutPickupCityHindi(from_city),
    generateAboutDropCityHindi(to_city),
    generateDistanceAndTimeHindi(from_city, to_city, distance, duration),
    generateFareExplanationHindi(from_city, to_city, route),
    generateVehicleOptionsHindi(from_city, to_city),
    generateWhyChooseUsHindi(from_city, to_city),
    generateOneWayBenefitsHindi(from_city, to_city),
    generateDriverSafetyHindi(from_city, to_city),
    generateFAQsHindi(from_city, to_city, distance, duration, basePrice),
    generateCTAHindi(from_city, to_city, basePrice)
  ];

  return sections.join('\n\n');
};

const calculateDuration = (km) => {
  const hours = Math.ceil(Number(km) / 50); 
  return `${hours} घंटे`;
};

const generateRouteOverviewHindi = (from, to, dist, time, price) => {
  return `
    <section id="overview">
      <h2>${from} से ${to} टैक्सी सेवा: आरामदायक वन-वे और राउंड ट्रिप कैब्स</h2>
      <p>क्या आप एक विश्वसनीय <strong>${from} से ${to} टैक्सी</strong> सेवा की तलाश कर रहे हैं? चाहे आप व्यापार यात्रा, पारिवारिक अवकाश, या अचानक यात्रा की योजना बना रहे हों, कैब बुक करना सबसे सुविधाजनक विकल्प है। <strong>${from} से ${to}</strong> की दूरी लगभग <strong>${dist} किलोमीटर</strong> है, और सड़क मार्ग से इस यात्रा को पूरा करने में लगभग <strong>${time}</strong> लगते हैं। हम पारदर्शी मूल्य निर्धारण के साथ बेहतरीन वन-वे कैब सेवाएं प्रदान करते हैं, जिसकी शुरुआत मात्र <strong>₹${price}</strong> से होती है।</p>
      <p>हमारे बेड़े में अच्छी तरह से बनाए रखा सेडान, एसयूवी और इनोवा क्रिस्टा जैसी प्रीमियम कारें शामिल हैं, जो एक सहज सवारी सुनिश्चित करती हैं। साझा कैब या बसों के विपरीत, एक निजी <strong>${from} से ${to} टैक्सी</strong> आपको अपनी सुविधानुसार रुकने, सुंदर रास्ते का आनंद लेने और गोपनीयता में यात्रा करने की स्वतंत्रता देती है। हमारे 24/7 ग्राहक सहायता और सत्यापित ड्राइवरों के साथ, आपकी सुरक्षा और आराम हमारी सर्वोच्च प्राथमिकताएं हैं।</p>
    </section>
  `;
};

const generateAboutPickupCityHindi = (city) => {
  return `
    <section id="about-pickup">
      <h3>${city} के बारे में</h3>
      <p>${city} अपनी समृद्ध संस्कृति, हलचल भरे बाजारों और ऐतिहासिक महत्व के लिए जाना जाने वाला एक जीवंत शहर है। एक प्रमुख केंद्र के रूप में, यह राज्य भर के विभिन्न महत्वपूर्ण स्थलों से जुड़ता है। चाहे आप स्थानीय निवासी हों या पर्यटक, ${city} से अपनी यात्रा शुरू करना हमारी डोरस्टेप पिकअप सेवा के साथ सुविधाजनक है। सार्वजनिक परिवहन की परेशानी से बचें और हमारे पेशेवर ड्राइवरों को शहर के ट्रैफिक को नेविगेट करने दें जबकि आप आराम करते हैं।</p>
    </section>
  `;
};

const generateAboutDropCityHindi = (city) => {
  return `
    <section id="about-drop">
      <h3>${city} के बारे में</h3>
      <p>${city} में पहुंचना हमेशा एक रोमांचक अनुभव होता है। अपने अनूठे आकर्षणों और स्वागत करने वाले माहौल के लिए जाना जाने वाला, ${city} दुनिया भर से यात्रियों को आकर्षित करता है। चाहे आप काम के लिए जा रहे हों या अवकाश के लिए, अपने गंतव्य तक आराम से पहुंचना आवश्यक है। हमारी कैब सेवा सुनिश्चित करती है कि आपको ठीक वहीं ड्रॉप किया जाए जहां आपको होना है, चाहे वह ${city} में कोई होटल, कार्यालय या निवास हो।</p>
    </section>
  `;
};

const generateDistanceAndTimeHindi = (from, to, dist, time) => {
  return `
    <section id="distance-time">
      <h3>${from} से ${to} दूरी और यात्रा का समय</h3>
      <p><strong>${from} और ${to}</strong> के बीच सड़क की दूरी लगभग <strong>${dist} किलोमीटर</strong> है। सामान्य ट्रैफिक स्थितियों में, इस ड्राइव में लगभग <strong>${time}</strong> लगते हैं। यह मार्ग सुंदर और अच्छी तरह से जुड़ा हुआ है, जिससे यह एक सुखद ड्राइव बन जाता है। हमारे ड्राइवर समय पर आपके गंतव्य तक पहुंचने के लिए सर्वोत्तम मार्गों से अच्छी तरह वाकिफ हैं, जहां संभव हो वहां अनावश्यक भीड़भाड़ से बचते हैं।</p>
      <p>हम तनाव मुक्त यात्रा का आनंद लेने और पर्याप्त समय के साथ ${to} पहुंचने के लिए जल्दी शुरुआत करने की सलाह देते हैं।</p>
    </section>
  `;
};

const generateFareExplanationHindi = (from, to, prices) => {
  return `
    <section id="taxi-fare">
      <h3>${from} से ${to} टैक्सी किराया: किफायती और पारदर्शी मूल्य निर्धारण</h3>
      <p>हम बिना किसी छिपे हुए शुल्क के पारदर्शी बिलिंग में विश्वास करते हैं। वन-वे ड्रॉप्स के लिए हमारा फिक्स्ड किराया चार्ट नीचे दिया गया है:</p>
      <table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">वाहन का प्रकार</th>
            <th style="padding: 10px; text-align: left;">वन-वे कीमत</th>
            <th style="padding: 10px; text-align: left;">बैठने की क्षमता</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">सेडान (Dzire/Etios)</td>
            <td style="padding: 10px;">₹${prices.sedan_price}</td>
            <td style="padding: 10px;">4 यात्री</td>
          </tr>
          <tr>
            <td style="padding: 10px;">एसयूवी (Ertiga)</td>
            <td style="padding: 10px;">₹${prices.ertiga_price}</td>
            <td style="padding: 10px;">6 यात्री</td>
          </tr>
          <tr>
            <td style="padding: 10px;">एसयूवी (Kia Carens)</td>
            <td style="padding: 10px;">₹${prices.carens_price}</td>
            <td style="padding: 10px;">6 यात्री</td>
          </tr>
          <tr>
            <td style="padding: 10px;">प्रीमियम एसयूवी (Innova Crysta)</td>
            <td style="padding: 10px;">₹${prices.innova_crysta_price}</td>
            <td style="padding: 10px;">6/7 यात्री</td>
          </tr>
        </tbody>
      </table>
      <p><em>नोट: टोल टैक्स, पार्किंग शुल्क और राज्य प्रवेश कर (यदि लागू हो) बेस किराए से बाहर हैं और वास्तविक रसीदों के अनुसार सीधे देय हैं।</em></p>
    </section>
  `;
};

const generateVehicleOptionsHindi = (from, to) => {
  return `
    <section id="vehicles">
      <h3>${from} से ${to} के लिए उपलब्ध कैब विकल्प</h3>
      <p>हम हर यात्रा की जरूरत और बजट के अनुरूप विविध बेड़े की पेशकश करते हैं:</p>
      <ul>
        <li><strong>सेडान (Sedan):</strong> छोटे परिवारों या जोड़ों (4 लोगों तक) के लिए आदर्श। मॉडल में स्विफ्ट डिजायर और टोयोटा इटियोस शामिल हैं। राजमार्ग ड्राइव के लिए कॉम्पैक्ट लेकिन आरामदायक।</li>
        <li><strong>एसयूवी (SUV 6+1):</strong> बड़े समूहों या अतिरिक्त सामान वाले परिवारों के लिए बिल्कुल सही। मारुति सुजुकी एर्टिगा पर्याप्त लेगरूम और बूट स्पेस प्रदान करती है।</li>
        <li><strong>प्रीमियम एसयूवी (Premium SUV):</strong> उन लोगों के लिए जो विलासिता पसंद करते हैं, टोयोटा इनोवा क्रिस्टा बेहतर आराम, कैप्टन सीटें और ${from} से ${to} राजमार्ग पर एक सहज सवारी के लिए एक शक्तिशाली इंजन प्रदान करती है।</li>
      </ul>
    </section>
  `;
};

const generateWhyChooseUsHindi = (from, to) => {
  return `
    <section id="why-choose-us">
      <h3>${from} से ${to} कैब बुकिंग के लिए हमें क्यों चुनें?</h3>
      <p>यात्रा सुखद होनी चाहिए, तनावपूर्ण नहीं। यहाँ बताया गया है कि हजारों ग्राहक अपनी <strong>${from} से ${to} टैक्सी</strong> जरूरतों के लिए हम पर भरोसा क्यों करते हैं:</p>
      <ul>
        <li><strong>डोर-टू-डोर सेवा:</strong> हम आपको ${from} में आपके घर से पिक करते हैं और ${to} में आपके सटीक स्थान पर ड्रॉप करते हैं।</li>
        <li><strong>समय पर पिकअप:</strong> हम आपके समय को महत्व देते हैं। हमारे ड्राइवर निर्धारित समय से 15 मिनट पहले पहुंचते हैं।</li>
        <li><strong>साफ और स्वच्छ कारें:</strong> स्वच्छता हमारी प्राथमिकता है। हर यात्रा से पहले सभी वाहनों की गहरी सफाई की जाती है।</li>
        <li><strong>विशेषज्ञ ड्राइवर:</strong> हमारे ड्राइवर अनुभवी, विनम्र और मार्ग के बारे में जानकार हैं।</li>
        <li><strong>24/7 सहायता:</strong> हमारी ग्राहक सहायता टीम बुकिंग या पूछताछ में आपकी सहायता के लिए चौबीसों घंटे उपलब्ध है।</li>
      </ul>
    </section>
  `;
};

const generateOneWayBenefitsHindi = (from, to) => {
  return `
    <section id="benefits">
      <h3>वन-वे टैक्सी बुक करने के लाभ</h3>
      <p><strong>${from} से ${to}</strong> के लिए वन-वे कैब बुक करना अक्सर राउंड ट्रिप से अधिक किफायती होता है यदि आप तुरंत लौटने की योजना नहीं बनाते हैं। आप केवल उस दूरी के लिए भुगतान करते हैं जो आप एक तरफ यात्रा करते हैं। यह इसके लिए एकदम सही है:</p>
      <ul>
        <li>${to} से उड़ान या ट्रेन पकड़ने वाले यात्री।</li>
        <li>विश्वविद्यालयों में जाने वाले छात्र।</li>
        <li>लंबे समय तक रहने के लिए बेस शिफ्ट करने वाले या रिश्तेदारों से मिलने जाने वाले परिवार।</li>
        <li>वन-वे प्रतिबद्धताओं वाले व्यापार यात्री।</li>
      </ul>
      <p>जब आपको इसकी आवश्यकता नहीं है तो राउंड ट्रिप के लिए भुगतान क्यों करें? हमारी समर्पित वन-वे सेवा के साथ पैसे बचाएं।</p>
    </section>
  `;
};

const generateDriverSafetyHindi = (from, to) => {
  return `
    <section id="safety">
      <h3>ड्राइवर विशेषज्ञता और सुरक्षा उपाय</h3>
      <p>आपकी सुरक्षा से समझौता नहीं किया जा सकता। हम हर सवारी के लिए सख्त सुरक्षा प्रोटोकॉल लागू करते हैं:</p>
      <ul>
        <li><strong>पृष्ठभूमि की जांच:</strong> सभी ड्राइवरों का पुलिस सत्यापन और पृष्ठभूमि की जांच की जाती है।</li>
        <li><strong>जीपीएस ट्रैकिंग:</strong> हमारी कारें रीयल-टाइम ट्रैकिंग के लिए जीपीएस से लैस हैं।</li>
        <li><strong>आपातकालीन सहायता:</strong> यात्रा के दौरान आपात स्थिति के लिए हमारे पास एक समर्पित हेल्पलाइन है।</li>
        <li><strong>ड्राइविंग मानक:</strong> ड्राइवरों को यातायात नियमों का सख्ती से पालन करने और ओवरस्पीडिंग से बचने के लिए प्रशिक्षित किया जाता है।</li>
      </ul>
    </section>
  `;
};

const generateFAQsHindi = (from, to, dist, time, price) => {
  return `
    <section id="faqs">
      <h3>अक्सर पूछे जाने वाले प्रश्न (FAQs)</h3>
      <div class="faq-item">
        <h4>1. ${from} से ${to} तक टैक्सी का किराया कितना है?</h4>
        <p>सेडान के लिए वन-वे टैक्सी का किराया ₹${price} से शुरू होता है। चुने गए मॉडल के आधार पर एसयूवी की कीमतें थोड़ी अधिक हैं।</p>
      </div>
      <div class="faq-item">
        <h4>2. कैब द्वारा ${from} से ${to} की यात्रा करने में कितना समय लगता है?</h4>
        <p>ट्रैफिक और सड़क की स्थिति के आधार पर, ${dist} किमी की दूरी तय करने में आमतौर पर लगभग ${time} लगते हैं।</p>
      </div>
      <div class="faq-item">
        <h4>3. क्या किराए में टोल टैक्स शामिल है?</h4>
        <p>नहीं, टोल टैक्स, पार्किंग शुल्क और राज्य प्रवेश कर अतिरिक्त हैं और वास्तविक रसीदों के अनुसार ग्राहक द्वारा भुगतान किया जाना है।</p>
      </div>
      <div class="faq-item">
        <h4>4. क्या मैं रात की यात्रा के लिए कैब बुक कर सकता हूं?</h4>
        <p>हां, हम 24/7 काम करते हैं। आप दिन या रात के किसी भी समय के लिए कैब बुक कर सकते हैं। देर रात शुरू होने वाली यात्राओं के लिए रात्रि शुल्क लागू हो सकते हैं।</p>
      </div>
      <div class="faq-item">
        <h4>5. क्या आप वापसी यात्रा सेवाएं प्रदान करते हैं?</h4>
        <p>बिल्कुल! हम वन-वे और राउंड-ट्रिप दोनों पैकेज प्रदान करते हैं। यदि आप कुछ दिनों के भीतर ${from} लौटने की योजना बनाते हैं तो आप राउंड ट्रिप बुक कर सकते हैं।</p>
      </div>
      <div class="faq-item">
        <h4>6. मैं ${from} से ${to} के लिए टैक्सी कैसे बुक कर सकता हूं?</h4>
        <p>आप बुकिंग फॉर्म भरकर हमारी वेबसाइट के माध्यम से आसानी से बुक कर सकते हैं, या बस हमारे कस्टमर केयर नंबर पर कॉल/व्हाट्सएप कर सकते हैं।</p>
      </div>
    </section>
  `;
};

const generateCTAHindi = (from, to, price) => {
  return `
    <section id="cta">
      <h3>आज ही अपनी ${from} से ${to} कैब बुक करें!</h3>
      <p>इंतजार मत करो! अपनी यात्रा के लिए सर्वोत्तम दरें सुरक्षित करें। हमारे साथ एक आरामदायक, सुरक्षित और परेशानी मुक्त सवारी का अनुभव करें। <strong>अपनी पहली सवारी पर 10% तक की बचत करने के लिए अभी कॉल करें या ऑनलाइन बुक करें।</strong></p>
      <p><strong>रूट:</strong> ${from} से ${to} | <strong>शुरुआती किराया:</strong> ₹${price}</p>
    </section>
  `;
};

export const validateKeywordUsageHindi = (content, keywords = []) => {
  if (!content) return { totalKeywords: 0, validKeywords: 0, invalidKeywords: [], keywordCounts: {}, status: 'error' };

  // Remove HTML tags for word count and text analysis
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(' ').length;

  const keywordCounts = {};
  const invalidKeywords = [];
  let validKeywordsCount = 0;

  keywords.forEach(keyword => {
    // Basic Hindi exact match logic - simpler than English regex due to complexity of script
    // Escaping special characters for RegExp
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    
    keywordCounts[keyword] = count;

    if (count >= 2) {
      validKeywordsCount++;
    } else {
      invalidKeywords.push({
        keyword,
        count,
        required: 2
      });
    }
  });

  let status = 'valid';
  if (wordCount < 1000) status = 'error'; 
  else if (invalidKeywords.length > 0) status = 'warning';
  
  if (invalidKeywords.length === 0 && wordCount >= 1000) status = 'valid';

  return {
    wordCount,
    totalKeywords: keywords.length,
    validKeywords: validKeywordsCount,
    invalidKeywords,
    keywordCounts,
    status
  };
};