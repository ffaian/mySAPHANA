var date = $.request.parameters.get('DATE');
var province = $.request.parameters.get('PROVINCE');
var holiday_id = $.request.parameters.get('HOLIDAY_ID');

var conn = $.db.getConnection();
var pstmt = conn
		.prepareStatement("insert into \"holiday\" values(?,?,?)");

pstmt.setString(1, date);
pstmt.setString(2, province);
pstmt.setString(3, holiday_id);

pstmt.execute();
conn.commit();
$.response.contentType = 'text/plain';
$.response.setBody('Data Inserted');
$.response.status = 200;

