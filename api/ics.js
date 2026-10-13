module.exports = function (req, res) {
  var d = req.body && req.body.d;
  if (req.method !== 'POST' || typeof d !== 'string' || d.indexOf('BEGIN:VCALENDAR') !== 0 || d.length > 500000) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Yeu cau khong hop le');
  }
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="lich-hen.ics"');
  res.setHeader('Cache-Control', 'no-store');
  res.end(d);
};
