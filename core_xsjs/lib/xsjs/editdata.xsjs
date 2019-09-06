var date = $.request.parameters.get('DATE');
var province = $.request.parameters.get('PROVINCE');
var holiday_id = $.request.parameters.get('HOLIDAY_ID');

var conn = $.db.getConnection();  
var pstmt = conn.prepareStatement( "update \"holiday\" set HOLIDAY_ID=? where DATE=? and PROVINCE=? " );
pstmt.setString(1,holiday_id);
pstmt.setString(2,date);  
pstmt.setString(3,province);  

pstmt.execute();  
conn.commit();  
$.response.contentType = 'text/plain';
    $.response.setBody('Data Updated');
    $.response.status = 200;   
    
/*
Test:
http://serin.sobeys.com:8000/ZRT_POS_CONTROL_TABLES/Holidays/editdata.xsjs?&DATE=2017-09-06&PROVINCE=MB&SITE=0000000600&WEATHER_IMPACT=Ice Storm&WEATHER_DURATION=8
*/