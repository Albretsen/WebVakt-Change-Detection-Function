const { app } = require('@azure/functions');
const PageDifferenceChecker = require('./src/services/difference')

app.http('check', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const { target, userId } = await request.json();

        const snapshot = await getSnapshot(target);

        const selectors = await getSelectors(target, userId);

        const differences = await PageDifferenceChecker.findDifferences(target, selectors);

        return { body: `Hello, ${JSON.stringify(differences)}!` };
    }
});

const getSelectors = async (target, userId) => {
    return [{
        "SelectorID": 1,
        "WebsiteID": 1,
        "UserID": 1,
        "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
        "Attribute": "textContent",
        "SnapshotValue": "A Message from Warren E. Buffett",
        "LastCheckDate": "2023-01-01",
    }, {
        "SelectorID": 2,
        "WebsiteID": 1,
        "UserID": 1,
        "SelectorString": "body > center > table > tbody > tr:nth-child(1) > td:nth-child(1) > ul > li > a",
        "Attribute": "href",
        "SnapshotValue": "https://www.berkshirehathaway.com/message.html",
        "LastCheckDate": "2023-01-01",
    }]
}


const getSnapshot = async (target) => {
    return `<!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-136883390-1"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'UA-136883390-1');
    </script>
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
    <html><head><title>BERKSHIRE HATHAWAY INC.</title>
    <meta content="text/html; charset=unicode" http-equiv="Content-Type">
    <meta name="GENERATOR" content="MSHTML 8.00.6001.18828"></head>
    <body link="#800080" bgcolor="#ffffff" text="#000080" vlink="#ff0000"><b><font size="6">
    <p align="center">B</font><font size="4">ERKSHIRE </font><font size="6">H</font><font 
    size=4>ATHAWAY </font><font size="2">INC.<br>3555 Farnam Street<br>Omaha, NE 68131</font><br>Official Home Page</b><font 
    size=1>&nbsp;</p></font>
    <hr>
    <p align="center">
    <center>
    <table border="0" cellspacing="0" width="90%">
      <tbody>
      <tr>
        <td height="55" valign="top" width="50%">
          <ul>
            <li><a href="message.html">A Message from Warren E. Buffett</a> 
        </li></ul></td>
       <td height="45" valign="top" width="50%">
          <ul>
            <li><a href="news/2024news.html">News Releases from Berkshire Hathaway and from Warren Buffett</a> <br><font 
            size=1>Updated February 24, 2024</font></li></ul></td></tr>
    
      <tr>
        <td height="45" valign="top" width="50%">
          <ul>
            <li><a href="reports.html">Annual &amp; Interim Reports</a> <br><font 
            size=1>Updated February 26, 2024<br></font></li></ul></td>
        <td height="45" valign="top" width="50%">
              <ul>
            <li><a href="sharehold.html">Annual Meeting Information</a> <br><font 
            size=1>Updated March 4, 2024<br></font></li></ul></td></tr>
      
        
      <tr>
        <td height="45" valign="top" width="50%">
          <ul>
            <li><a 
            href="http://www.sec.gov/cgi-bin/browse-edgar?company=berkshire+hathaway&amp;match=&amp;CIK=&amp;filenum=&amp;State=&amp;Country=&amp;SIC=&amp;owner=exclude&amp;Find=Find+Companies&amp;action=getcompany">Link 
            to SEC Filings</a> </li></ul></font></td>
        <td height="45" valign="top" width="50%">
          <ul>
             <li><a href="bhenergy/bhenergypresentations.html">Berkshire Hathaway Energy Investor Presentations</a>
                        </li></ul></td></tr>
      <tr>
        <td height="45" valign="top" width="50%">
          <ul>
            <li><a href="SpecialLetters/WEBCTMLtr.html">Special Letters from Warren & Charlie RE:Past, Present and Future</a> </li></ul></td>
        <td height="55" valign="top" width="50%">
          <ul>
            <li><a href="letters/letters.html">Warren Buffett's Letters to Berkshire 
            Shareholders</a> <br><font size="1">Updated February 24, 2024<br></font>
                        </li></ul></td></tr>
                    
      <tr>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="subs/sublinks.html">Links to Berkshire Subsidiary 
            Companies</a> <br><font size="1"><br></font></li></ul></td>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="wesco/WescoHome.html">Charlie Munger's Letters to Wesco Shareholders</a><br></font>
                                 </li></ul></td></tr>
    
      <tr>
        <td height="45" valign="top" width="50%">
          <ul>
            <li><a href="govern/govern.html">Corporate Governance</a> <br><font 
            size=1><br></li></ul></td>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="https://www.ebay.com/itm/185860708853">Celebrating 50 Years of a Profitable Partnership</a><br><font size="1">(A commemorative book first sold at the 2015 Annual Meeting and now for sale on eBay.)</a>
                        </li></ul></td></tr>
    
      <tr>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="sustainability/sustainabilityintro.html">Sustainability</a></li></ul></td>
        <td height="55" valign="top" width="50%">
            <ul>
            <li><a href="brkshareholderinfo/brkshareholderinfo.html">Common Stock Information</a></li>
                           </ul></td></tr>
    
      <tr>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="donate/webdonat.html">Letters from Warren E. Buffett Regarding Pledges to Make Gifts of Berkshire Stock</a></li>
                           </ul></td>
    
        <td height="55" valign="top" width="50%">
            <ul>
            <li><a href="activisionltr.pdf">Facts Regarding Berkshire's 2021 Investments in Activision Common Stock 
            </a> </li></ul></td></tr>
                    
      <tr>
        <td height="45" valign="top" width="50%">
            <ul>
            <li><a href="http://www.berkshirewear.com">Berkshire Activewear</a></li>
                           </ul></td>
    
        <td height="55" valign="top" width="50%">
            <ul>
            </ul></td></tr>
     
                    
    
    
    </tbody></table></center>
    <p></p>
    <p align="center">
    <div></div>
    <p></p>
    <p>
    <hr>
    
    <p></p>
    <p align="center"><a href="http://www.geico.com/"><img border="0" 
    alt="GEICO logo" src="geicoimg.gif" width=75 height=15><font 
    size=1><br></font></a><font size="1">FOR A FREE CAR INSURANCE RATE QUOTE THAT 
    COULD SAVE YOU SUBSTANTIAL MONEY<br><a 
    href="http://www.geico.com/">WWW.GEICO.COM</a> OR CALL 
    1-888-395-6349, 24 HOURS A DAY</font></p>
    <p>
    <hr>
    
    
    <p></p><font size="2">
    <p><a name="LETTERS"><a name="OWNER"><a name="STOCKCLASS"><a 
    name=LINKS></a></a></a></a>If you have any comments about our WEB page, you can 
    write us at the address shown above.  However, due to 
    the limited number of personnel in our corporate office, we are unable to 
    provide a direct response.</p></font>
    <p>
    <hr>
    
    
    <dl><p></p><p align="left"><font size="2"><a href="disclaimer.html">Legal Disclaimer</a> 
    <p align="left">Copyright &copy; 1978-2024<b> Berkshire Hathaway Inc.</b></font><font size="2"> 
    </dl>
    <p><a name="ANNUAL"><a name="INTERIM"><a name="WEBLETTER"><a name="ACTIVEWEAR"><a 
    name=ANNMTG></a></a></a></a></a></p></font></body></html>
    `
}
