/* Lịch âm Việt Nam (UTC+7) + Can Chi, Trực, Sao, Hoàng đạo */
(function (g) {
  var TZ = 7;
  function INT(d) { return Math.floor(d); }
  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    return dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  }
  function jdToDate(jd) {
    var a = jd + 32044, b = INT((4 * a + 3) / 146097), c = a - INT(b * 146097 / 4);
    var d = INT((4 * c + 3) / 1461), e = c - INT(1461 * d / 4), m = INT((5 * e + 2) / 153);
    return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
  }
  function NewMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 -= 0.4068 * Math.sin(Mpr * dr) - 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) - 0.0004 * Math.sin(dr * (2 * F + M));
    C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) + 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
                     : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Jd1 + C1 - dt;
  }
  function SunLon(jdn) {
    var T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = Math.PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    return L - Math.PI * 2 * INT(L / (Math.PI * 2));
  }
  function sunSeg(jd) { return INT(SunLon(jd - 0.5 - TZ / 24) / Math.PI * 6); }
  function sunDeg(jd) { return SunLon(jd - 0.5 - TZ / 24) * 180 / Math.PI; }
  function nmDay(k) { return INT(NewMoon(k) + 0.5 + TZ / 24); }
  function month11(yy) {
    var off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853), nm = nmDay(k);
    if (sunSeg(nm) >= 9) nm = nmDay(k - 1);
    return nm;
  }
  function leapOff(a11) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5), last = 0, i = 1, arc = sunSeg(nmDay(k + i));
    do { last = arc; i++; arc = sunSeg(nmDay(k + i)); } while (arc != last && i < 14);
    return i - 1;
  }
  function solar2lunar(dd, mm, yy) {
    var dn = jdFromDate(dd, mm, yy), k = INT((dn - 2415021.076998695) / 29.530588853);
    var ms = nmDay(k + 1); if (ms > dn) ms = nmDay(k);
    var a11 = month11(yy), b11 = a11, ly;
    if (a11 >= ms) { ly = yy; a11 = month11(yy - 1); } else { ly = yy + 1; b11 = month11(yy + 1); }
    var ld = dn - ms + 1, diff = INT((ms - a11) / 29), leap = 0, lm = diff + 11;
    if (b11 - a11 > 365) {
      var lo = leapOff(a11);
      if (diff >= lo) { lm = diff + 10; if (diff == lo) leap = 1; }
    }
    if (lm > 12) lm -= 12;
    if (lm >= 11 && diff < 4) ly -= 1;
    return { d: ld, m: lm, y: ly, leap: leap, jd: dn };
  }
  function lunar2solar(ld, lm, ly) {
    var a11, b11;
    if (lm < 11) { a11 = month11(ly - 1); b11 = month11(ly); } else { a11 = month11(ly); b11 = month11(ly + 1); }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853), off = lm - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365 && off >= leapOff(a11)) off += 1;
    return jdToDate(nmDay(k + off) + ld - 1);
  }
  var CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  var CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  var TRUC = [
    ['Kiến',0,'xuất hành, khai trương nhỏ','động thổ, an táng'],
    ['Trừ',1,'dọn dẹp, chữa bệnh, cúng tế','cưới hỏi, đi xa'],
    ['Mãn',1,'cầu tài, làm lễ, nhập kho','khởi công lớn, an táng'],
    ['Bình',0,'việc thường, sửa chữa nhỏ, đi lại','việc trọng đại'],
    ['Định',1,'cưới hỏi, ký kết, nhận việc','kiện tụng, đi xa'],
    ['Chấp',0,'xây dựng, trồng cấy, lập kế hoạch','di chuyển, khai trương'],
    ['Phá',-1,'phá dỡ, dọn dẹp','cưới hỏi, khai trương, ký kết'],
    ['Nguy',-1,'cúng lễ, cẩn trọng','leo trèo, đi xa, việc mạo hiểm'],
    ['Thành',1,'cưới hỏi, khai trương, nhập học, ký kết','kiện tụng'],
    ['Thu',0,'thu hoạch, thu nợ, nhập hàng','an táng, xuất hành'],
    ['Khai',1,'khai trương, động thổ, xuất hành, cưới hỏi','an táng'],
    ['Bế',-1,'đắp đê, lấp hố, nghỉ ngơi','khai trương, cưới hỏi, xuất hành']
  ];
  var SAO = [['Giác',1],['Cang',-1],['Đê',-1],['Phòng',1],['Tâm',-1],['Vĩ',1],['Cơ',1],['Đẩu',1],['Ngưu',-1],['Nữ',-1],['Hư',-1],['Nguy',-1],['Thất',1],['Bích',1],['Khuê',-1],['Lâu',1],['Vị',1],['Mão',-1],['Tất',1],['Chủy',-1],['Sâm',1],['Tỉnh',1],['Quỷ',-1],['Liễu',-1],['Tinh',-1],['Trương',1],['Dực',-1],['Chẩn',1]];
  var SAO_OFF = 11;
  var THAN = [['Thanh Long',1],['Minh Đường',1],['Thiên Hình',0],['Chu Tước',0],['Kim Quỹ',1],['Thiên Đức',1],['Bạch Hổ',0],['Ngọc Đường',1],['Thiên Lao',0],['Huyền Vũ',0],['Tư Mệnh',1],['Câu Trần',0]];
  var THAN_START = [0, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6, 8, 10]; /* tháng âm 1..12 -> chi của ngày Thanh Long (Tý=0) */
  var GIO_HD = [[0,1,3,6,8,9],[2,3,5,8,10,11],[0,1,4,5,7,10],[0,2,3,6,7,9],[2,4,5,8,9,11],[1,4,6,7,10,11]];
  function baseInfo(d, m, y) {
    var l = solar2lunar(d, m, y), jd = l.jd;
    var chi = (jd + 1) % 12, can = (jd + 9) % 10;
    var mChi = (INT(((sunDeg(jd) - 315 + 360) % 360) / 30) + 2) % 12;
    var tr = TRUC[(chi - mChi + 12) % 12];
    var sIdx = (jd + SAO_OFF) % 28, sao = SAO[sIdx];
    var tIdx = (chi - THAN_START[l.m] + 12) % 12, than = THAN[tIdx];
    var score = than[1] + sao[1] + tr[1];
    var gio = GIO_HD[chi % 6].map(function (i) {
      return CHI[i] + ' ' + ((i * 2 + 23) % 24) + '-' + ((i * 2 + 1) % 24);
    });
    return {
      ld: l.d, lm: l.m, ly: l.y, leap: l.leap, jd: jd,
      canChiNgay: CAN[can] + ' ' + CHI[chi],
      canChiThang: CAN[(l.y * 12 + l.m + 3) % 10] + ' ' + CHI[(l.m + 1) % 12],
      canChiNam: CAN[(l.y + 6) % 10] + ' ' + CHI[(l.y + 8) % 12],
      truc: tr[0], trucR: tr[1], nen: tr[2], tranh: tr[3],
      sao: sao[0], saoR: sao[1], than: than[0], hoangDao: than[1] === 1,
      gio: gio, score: score, rating: score >= 2 ? 1 : score <= -2 ? -1 : 0
    };
  }

  var HC = ['Mộc','Mộc','Hỏa','Hỏa','Thổ','Thổ','Kim','Kim','Thủy','Thủy'];
  var HZ = ['Thủy','Thổ','Mộc','Mộc','Thổ','Hỏa','Hỏa','Thổ','Kim','Kim','Thổ','Thủy'];
  var SINH = {Mộc:'Hỏa',Hỏa:'Thổ',Thổ:'Kim',Kim:'Thủy',Thủy:'Mộc'}, KHAC = {Mộc:'Thổ',Thổ:'Thủy',Thủy:'Hỏa',Hỏa:'Kim',Kim:'Mộc'};
  var NAP = ['Hải trung kim','Lô trung hỏa','Đại lâm mộc','Lộ bàng thổ','Kiếm phong kim','Sơn đầu hỏa','Giản hạ thủy','Thành đầu thổ','Bạch lạp kim','Dương liễu mộc','Tuyền trung thủy','Ốc thượng thổ','Tích lịch hỏa','Tùng bách mộc','Trường lưu thủy','Sa trung kim','Sơn hạ hỏa','Bình địa mộc','Bích thượng thổ','Kim bạch kim','Phú đăng hỏa','Thiên hà thủy','Đại trạch thổ','Thoa xuyến kim','Tang đố mộc','Đại khê thủy','Sa trung thổ','Thiên thượng hỏa','Thạch lựu mộc','Đại hải thủy'];
  var TIET = ['Xuân phân','Thanh minh','Cốc vũ','Lập hạ','Tiểu mãn','Mang chủng','Hạ chí','Tiểu thử','Đại thử','Lập thu','Xử thử','Bạch lộ','Thu phân','Hàn lộ','Sương giáng','Lập đông','Tiểu tuyết','Đại tuyết','Đông chí','Tiểu hàn','Đại hàn','Lập xuân','Vũ thủy','Kinh trập'];
  var SAO_E = ['Mộc','Kim','Thổ','Nhật','Nguyệt','Hỏa','Thủy','Mộc','Kim','Thổ','Nhật','Nguyệt','Hỏa','Thủy','Mộc','Kim','Thổ','Nhật','Nguyệt','Hỏa','Thủy','Mộc','Kim','Thổ','Nhật','Nguyệt','Hỏa','Thủy'];
  var HYTHAN = ['Đông Bắc','Tây Bắc','Tây Nam','Chính Nam','Đông Nam','Đông Bắc','Tây Bắc','Tây Nam','Chính Nam','Đông Nam'];
  var TAITHAN = ['Đông Nam','Đông Nam','Đông','Đông','Bắc','Bắc','Tây Nam','Tây Nam','Tây','Tây'];
  var BP_CAN = ['Không nên mở kho, dễ hao tài vật','Không nên trồng cây, cây khó lớn','Không nên sửa bếp, dễ gặp hỏa hoạn','Không nên cạo đầu, dễ sinh mụn nhọt','Không nên nhận ruộng đất, dễ bất lợi','Không nên phá hủy giấy tờ, khế ước','Không nên quay tơ, dệt cửi, dễ hư hại','Không nên làm tương, dễ hỏng','Không nên tháo nước, đắp bờ, khó thông','Không nên kiện tụng, dễ yếu thế'];
  var BP_CHI = ['Không nên xem bói, tự rước họa','Không nên đội mũ, nhận chức','Không nên tế tự, thần không chứng','Không nên đào giếng, nước kém','Không nên khóc lóc, dễ gặp tang','Không nên đi xa, dễ thất thoát tài vật','Không nên lợp nhà, dễ phải làm lại','Không nên uống thuốc lạ','Không nên kê giường, dễ bất an','Không nên mời khách, dễ chia ly','Không nên ăn thịt chó, dễ gặp điều lạ','Không nên cưới gả, dễ chia ly'];
  var DCK = {1:[13],2:[11],3:[9],4:[7],5:[5],6:[3],7:[8,29],8:[27],9:[25],10:[23],11:[21],12:[19]};
  function mod(a, n) { return ((a % n) + n) % n; }
  function info(d, m, y) {
    var r = baseInfo(d, m, y), jd = r.jd, can = mod(jd + 9, 10), chi = mod(jd + 1, 12);
    var nx = jdToDate(jd + 1), nl = solar2lunar(nx[0], nx[1], nx[2]);
    var ky = [];
    if ([5, 14, 23].indexOf(r.ld) >= 0) ky.push('Nguyệt kỵ');
    if (nl.d === 1) ky.push('Nguyệt tận');
    if ([3, 7, 13, 18, 22, 27].indexOf(r.ld) >= 0) ky.push('Tam nương');
    if ((DCK[r.lm] || []).indexOf(r.ld) >= 0) ky.push('Dương Công kỵ nhật');
    var k = 0; while (k < 60 && !(k % 10 === can && k % 12 === chi)) k++;
    var nap = NAP[Math.floor(k / 2)], hc = HC[can], hz = HZ[chi], rl;
    if (hc === hz) rl = ['Can Chi tương đồng (' + hc + ')', 'ngày cát'];
    else if (SINH[hc] === hz) rl = ['Can sinh Chi (' + hc + ' sinh ' + hz + ')', 'ngày cát'];
    else if (SINH[hz] === hc) rl = ['Chi sinh Can (' + hz + ' sinh ' + hc + ')', 'ngày cát'];
    else if (KHAC[hc] === hz) rl = ['Can khắc Chi (' + hc + ' khắc ' + hz + ')', 'ngày bình'];
    else rl = ['Chi khắc Can (' + hz + ' khắc ' + hc + ')', 'ngày hung'];
    var th = mod(chi, 4), tam = [CHI[mod(chi + 4, 12)], CHI[mod(chi + 8, 12)]];
    var gioSet = {}; r.gio.forEach(function (g) { gioSet[g.split(' ')[0]] = 1; });
    var hac = []; for (var i = 0; i < 12; i++) if (!gioSet[CHI[i]]) hac.push(CHI[i] + ' ' + ((i * 2 + 23) % 24) + '-' + ((i * 2 + 1) % 24));
    var deg = sunDeg(jd), ti = Math.floor(deg / 15) % 24;
    var diem = (r.hoangDao ? 2 : -1) + r.saoR + r.trucR - ky.length;
    var x = {
      can: can, chi: chi, ky: ky, napAm: nap, hanhNgay: hc, quanHe: rl[0], quanHeCat: rl[1],
      lucHop: CHI[mod(13 - chi, 12)], tamHop: tam, tamHopCuc: ['Thủy','Kim','Hỏa','Mộc'][th],
      xung: CHI[mod(chi + 6, 12)], hai: CHI[mod(7 - chi, 12)],
      pha: CHI[[9,4,11,6,1,8,3,10,5,0,7,2][chi]],
      hyThan: HYTHAN[can], taiThan: TAITHAN[can], bpCan: BP_CAN[can], bpChi: BP_CHI[chi],
      gioHac: hac, tiet: TIET[ti], kinhDo: ti * 15, saoHanh: SAO_E[mod(jd + SAO_OFF, 28)],
      diem: diem, danhGia: diem >= 4 ? 'Rất tốt' : diem >= 2 ? 'Tốt' : diem >= 0 ? 'Bình thường' : 'Xấu',
      dayCan: can
    };
    for (var key in x) r[key] = x[key];
    return r;
  }
  function gioHienTai(jd, hour) {
    var idx = Math.floor((hour + 1) / 2) % 12, c = mod(jd + 9 + (hour >= 23 ? 1 : 0), 10);
    return CAN[(mod(c, 5) * 2 + idx) % 10] + ' ' + CHI[idx];
  }
  var api = { info: info, gioHienTai: gioHienTai, solar2lunar: solar2lunar, lunar2solar: lunar2solar };
  if (typeof module !== 'undefined') module.exports = api; else g.Lunar = api;
})(this);
