'use strict';

const $ = require('jquery');

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

  /**
   * Display result to top-right of the display.
   **/
  function showToastWrapper() {
    if ( $('#jsi-toast').length > 0 ) {
      $('#jsi-toast').remove();
    }

    const listWrapper = `
      <style>
        ul.g-toasts {
          z-index: 999999;
          position: fixed;
          top: 10px;
          right: 10px;
          margin: 0;
          padding: 0;
          font-family: monospace;
        }

        ul.g-toasts > li {
          margin: 0;
          padding: 14px;
          box-sizing: border-box;
          color: #FFFFFF;
          font-size: 14px;
          font-family: inherit;
          font-weight: normal;
        }

        ul.g-toasts > li + li {
          margin-top: 10px;
        }

        ul.g-toasts > .g-toast__DONE {
          background-color: rgba(36, 186, 36, 0.75);
        }

        ul.g-toasts > .g-toast__SKIP {
          background-color: rgba(232, 45, 45, 0.75);
        }
      </style>

      <ul id="jsi-toast" class="g-toasts"></ul>
    `;

    $('body').append(listWrapper);
  }


  /**
   * Show each toasts.
   * This should not be called by root.
   **/
  function insertToast(type, condition, controlledElementsLength) {
    if ( $('#jsi-toast').length < 1 ) {
      throw new Error('ToastWrapper is not defined, aborted.');
    }

    let message;

    switch(condition) {
      case 'SKIP':
        message = `Element with type "${type}" is not supported, skipped.`;
        break;

      case 'DONE':
        message = `${controlledElementsLength} of elements controlled, finished.`;
        break;

      default:
        throw new Error(`The condition "${condition}" is not under consideration, aborted.`);
        break;
    }

    const item = `
      <li class="g-toast__${condition}">${message}</li>
    `;

    $('#jsi-toast').append(item);

    hideToast();
  }


  /**
   * Hide toasts.
   * This should not be called by root.
   **/
  function hideToast() {
    if ( $('#jsi-toast').length < 1 ) {
      throw new Error('ToastWrapper is not defined, aborted.');
    }

    $('#jsi-toast').click(function() {
      $(this).remove();
    });
  }


  /**
   * Check language code for generate characters.
   * This should not be called by root.
   **/
  function getCharacters(language) {
    let languageCode;
    if (typeof language === 'undefined') {
      languageCode = 'en';
    } else {
      languageCode = language.substr(0,2);
    }

    // Define basic characters previously
    let characters = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~±×÷≠`;

    switch(languageCode) {
      // Greek
      case 'el':
        characters += 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω';
        break;

      // Russian
      case 'ru':
        characters += 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        break;

      // Japanese
      case 'ja':
        characters += `　ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯｰﾞﾟ｡｢｣､･ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓∈∋⊆⊇⊂⊃∪∩∧∨￢⇒⇔∀∃∠⊥⌒∂∇＝≡≒≪≫√∽∝∵∫∬Å‰♯♭♪†‡¶◯─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼∮∑∟⊿ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ￤＇＂一乙九七十人二入八力刀丁又了下口三山子女小上夕千川大土丸弓工才万士久干己寸亡及丈凡与刃巾乞円王火月犬五手水中天日木文六引牛今元戸午公止少心切太内父分方毛友区化反予欠氏不夫支比仏尺収仁介刈凶互井丹匹斤幻孔冗双斗乏升弔屯厄牙勾爪匂片玉左四出正生石田白本目右立外兄古広矢市台冬半母北用央去号皿仕写主申世他打代皮氷平由礼以加功札史司失必付辺包末未民令圧永可刊旧句示犯布弁穴冊処庁幼甘丘巨玄込召占奴払矛甲巧斥凹且囚汁仙凸尼丙瓦叱尻旦丼氾休気糸字耳先早竹虫年百名羽会回交光考行合寺自色西多池地当同肉米毎安曲血向死次式守州全有羊両列衣印各共好成争仲兆伝灯老因仮件再在舌団任宇灰危机吸后至存宅扱芋汚汗朽叫仰旨芝朱舟巡旬尽吐弐忙劣企吉刑如匠伐帆伏吏缶江充迅壮肌妃朴妄伎臼汎花貝見車赤足村男町何角汽近形言谷作社図声走体弟売麦来里医究局君決住助身対投豆坂返役位囲改完希求芸告材児初臣折束低努兵別利良冷労応快技均災志似序状条判防余我系孝困私否批忘卵乱壱戒含却狂迎更抗攻伺秀床吹即沢沖沈抜尾坊妙肝忌岐坑克寿伸辛択尿伴芳邦妨没抑励亜吟呉佐肖抄杉妥但呈廷忍妊把伯扶戻串沙芯汰那阪肘冶妖沃呂弄雨学空金青林岩京国姉知長直店東歩妹明門夜委育泳岸苦具幸始使事実者昔取受所注定波板表服物放味命油和英果芽官季泣協径固刷参治周松卒底的典毒念府法牧例易往価河居券効妻枝舎述承招性制版肥非武沿延拡供呼刻若宗垂担宙忠届乳拝並宝枚依押奇祈拠況屈肩刺沼征姓拓抵到突杯泊拍迫彼怖抱肪茂炎欧殴佳怪岳拘祉侍邪昇炊阻卓抽泌苗奉房免炉拐劾宜拒享茎弦肯昆肢叔尚枢斉析拙坪邸泥迭披附侮沸併泡奔抹岬盲枠宛旺岡苛玩股虎采刹呪狙妬奈阜枕弥拉音草科海活計後室首秋春食星前茶昼点南風屋界客急級係県研指持拾重昭乗神相送待炭柱追度畑発美秒品負面洋胃栄紀軍型建律昨祝省信浅単飛変便約勇要逆限故厚査政祖則退独保迷映革看巻皇紅砂姿城専宣染泉洗奏段派肺背威為皆狭枯荒香恒咲狩柔盾侵是俗耐珍怒逃峠柄冒盆郎哀卸架悔冠軌虐峡契弧孤郊恨削施牲促胎怠胆訂帝卑赴封胞某幽厘姻疫垣括糾挟洪侯拷砕臭俊叙浄津甚帥窃荘衷挑勅亭貞洞柳畏茨咽怨柿柵拶拭栃虹眉訃勃昧侶思校家夏記帰原高紙時弱書通馬院員荷起宮庫根酒消真息速庭島配倍病勉旅流案害挙訓郡候航差殺残借笑席倉孫帯徒特梅粉脈浴料連益桜恩格個耕財師修素造能破俵容留株胸降骨座蚕射従純除将針値展党討納俳班秘陛鬼恐恵兼軒剣剤脂称浸振陣扇恥致途透唐桃倒胴悩般被疲浜敏浮捕峰砲眠娘紋涙烈恋朗悦宴華既脅倹悟娯疾殊徐辱粋衰隻桑託畜哲凍匿畔姫紛倣埋浪翁蚊核陥飢恭貢剛唆栽宰索桟酌珠准殉祥症宵娠唇畝逝栓租捜挿泰逐秩朕逓浦俸剖紡耗竜倫挨唄俺釜桁拳挫恣袖凄脊捉酎捗哺冥脇剝魚教強黄黒細週雪船組鳥野理悪球祭習終宿章商進深族第帳笛転都動部問貨械救健康菜産唱清巣側停堂得敗票副望陸移液眼規基寄許経険現混採授術常情責設接断張貧婦務率略異域郷済視捨推盛窓探著頂脳閉訪密訳郵翌欲陰菓乾脚掘婚彩惨執斜釈寂紹脱淡添盗販描猛粒郭掛勘貫菊虚偶啓掲控紺赦酔惜措粗掃逮袋窒彫陳陶豚粘婆排陪符崩隆猟陵尉逸涯殻喝渇患偽菌蛍渓斎崎蛇渋粛淑庶渉訟剰紳崇据旋曹眺釣偵悼軟培舶猫瓶偏堀麻唯悠庸涼累萎淫崖亀惧舷梗頃痕埼斬鹿羞戚曽爽唾堆貪梨捻森雲絵間場晴朝答道買番飲運温開階寒期軽湖港歯集暑勝植短着等登湯童悲筆遊葉陽落街覚喜給極景結最散順焼象隊達貯然博飯費無満量営過賀検減証税絶測属貸程提統備評富復報割揮貴筋勤敬裁策詞衆就善装創尊痛晩補棒握偉越援奥幾距御堅圏項紫煮畳殖尋訴替弾遅堤渡塔鈍普幅傍帽雄絡惑腕詠敢換喚棋欺喫遇雇硬慌絞軸湿晶掌焦遂随婿葬超痘蛮募揚揺裂廊湾渦棺堪款閑暁琴隅詐酢傘滋循硝粧詔診疎喪堕惰棚塚搭筒棟廃媒扉雰塀遍愉裕猶痢硫塁嵐椅媛葛喉須痩貼椎斑喩湧貿遠園楽新数電話暗意感漢業詩想鉄農福路愛塩試辞照節戦続置腸働解幹義禁群鉱罪資飼準勢損墓豊夢預絹源署傷蒸誠聖暖賃腹幕盟裏違煙鉛暇雅較勧詰傾遣誇鼓継歳載詳飾触慎寝跡僧嘆蓄跳殿搬微誉腰溶雷嫁塊慨該隔滑棄愚携催債搾慈摂賊滞滝稚塗飽滅裸零廉楼猿虞禍靴褐寛頑傑嫌献碁溝嗣酬愁奨睡践禅塑痴艇督漠鉢煩頒酪虜鈴賄彙楷蓋毀嗅僅窟詣隙傲塞嫉腫腎裾煎羨腺詮溺頓蜂睦慄賂塡歌語算読聞鳴駅銀鼻様緑練関管旗察種静説漁歴演慣境構際雑酸製精銭総増像態適銅徳複綿領閣疑誤穀誌磁障層認暮模維隠箇駆豪雌需端徴摘滴稲髪罰腐漫慢網踊暦概綱酵獄魂遭憎奪碑漂慕墨膜誘漏寡酷漆遮銃塾緒彰誓漸駄嫡漬寧閥僕銘僚熊箋遡遜綻蔑貌蜜瘍辣瑠線横談調箱億課器賞選熱標養輪確潔賛質敵導編暴遺劇権熟諸蔵誕潮論鋭影縁監歓輝儀戯撃稿趣震澄踏輩範盤膚敷賦舞噴舗黙慮慰閲餓緩緊撮暫潤遵衝嘱審穂請潜諾駐鋳墜締墳魅憂霊謁稼潟窮勲慶賜縄遷槽徹撤賠罷賓憤幣弊褒撲摩窯履寮潰畿憬稽駒摯餌憧踪誰嘲罵箸膝蔽餅璃親頭館橋整薬機積録衛興築燃輸激憲鋼樹縦操糖奮緯憶壊獲獣薪濁曇濃薄繁避壁謡頼隣隷穏凝憩賢墾錯諮錠嬢壇篤縛縫謀膨擁錬懐還憾薫衡儒壌薦磨諭融諧骸錦錮醒膳緻諦賭麺頰講謝績厳縮優覧環鮮燥翼療齢犠擦鍛聴嚇轄擬矯謹謙購懇爵醜償礁繊霜濯謄頻曖臆鍵戴瞳謎鍋闇瞭顔曜題観験類額職織簡難臨鎖瞬騒贈闘離穫騎繕礎鎮藩覆癖翻濫糧襟顕繭懲癒顎鎌韓藤璧藍願鏡識警臓繰爆霧麗鶏鯨髄瀬簿韻璽藻覇譜羅艶蹴麓議競護響欄鐘譲籍懸醸騰躍露顧魔艦鶴驚襲籠鑑鬱`;
        break;

      default:
        break;
    }

    return characters;
  }


  /**
   * Generate random string for each HTML form elements.
   * This should not be called by root.
   **/
  function randomStringGenerator(maxlength, type) {
    if (typeof maxlength === 'undefined') {
      throw new Error('maxlength is not defined!');
    }

    let characterSet;
    let string = '';

    switch(type) {
      case 'url':
        characterSet = `:/?#[]@!$&'()*+,;0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
        break;

      case 'email':
        characterSet = `-_.*!#$@%&'*+/=?^\`{|}~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
        break;

      case 'number':
        characterSet = '0123456789';
        break;

      case 'tel':
        characterSet = '0123456789+-';
        break;

      default:
        characterSet = getCharacters($('html').attr('lang'));
        break;
    }

    for (let i = 0; i < maxlength; i++) {
      string += characterSet[ Math.floor(Math.random() * characterSet.length) ];
    }

    return string;
  }

  /**
   * MaxLength helper.
   * This should not be called by root.
   **/
  function getMaxLength($element) {
    return parseInt($element.attr('maxlength'), 10);
  }


  /**
   * Fill in or select each form elements.
   **/
  function formElementController() {
    const $input = $('input');
    const $select = $('select');
    const $textarea = $('textarea');
    let currentNumber = 0;

    $input.each(function() {
      const maxLength = getMaxLength($(this)) ? parseInt(getMaxLength($(this)), 10) : 50;
      const type = $(this).attr('type');

      switch (type) {
        case 'checkbox':
        case 'radio':
          const isChecked = Math.random() - Math.random() > 0;
          $(this).prop('checked', isChecked);
          if ( isChecked ) currentNumber++;
          break;

        case 'hidden':
        case 'submit':
        case 'button':
          break;

        case 'datetime':
        case 'date':
        case 'month':
        case 'week':
        case 'time':
        case 'datetime-local':
        case 'range':
        case 'color':
        case 'file':
          insertToast($(this).attr('type'), 'SKIP');
          break;

        default:
          $(this).val(randomStringGenerator(maxLength, type));
          currentNumber++;
          break;
      }
    });

    $select.each(function() {
      const $options = $(this).children('option');
      const isMultiple = typeof $(this).attr('multiple') !== 'undefined';

      if ( !isMultiple ) {
        const selection = ~~(Math.random() * ($options.length - 1));
        $options.eq(selection + 1).prop('selected', true);

      } else {
        const selectionLength = ~~(Math.random() * ($options.length));

        for (var i = 0; i < selectionLength; i++) {
          $options.eq(~~(Math.random() * $options.length)).prop('selected', true);
        }
      }

      currentNumber++;
    });

    $textarea.each(function() {
      const maxLength = getMaxLength($(this)) ? getMaxLength($(this)) : 1000;
      $(this).val(randomStringGenerator(maxLength));
      currentNumber++;
    });

    insertToast(null, 'DONE', currentNumber);
  }


  /**
   * Activate each functions
   **/
  showToastWrapper();
  formElementController();
});
