var date = $.request.parameters.get('DATE');
var province = $.request.parameters.get('PROVINCE');

var conn = $.db.getConnection();  
var pstmt = conn.prepareStatement( "delete from \"holiday\" where DATE=? and PROVINCE=? " );
  
pstmt.setString(1,date);  
pstmt.setString(2,province);  

pstmt.execute();  
conn.commit();  
$.response.contentType = 'text/plain';
    $.response.setBody('Data Deleted');
    $.response.status = 200; 
var rs = pstmt.executeQuery();

/*
Test :
http://serin.sobeys.com:8000/FERNANFA/XS_CLASSIC_POC/deletedata.xsjs?email=whatever@example.com
*/