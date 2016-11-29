<%@page session="false"
    import="java.net.*,java.io.*"
%><%

/**
   This page contains a possible example of back-end page used to retrieve the annotations for the PMCID specified. It is accepting a pmcid parameter and it is expected to output the annotations in the following format:
   {"pmcId":"PMC5047790","results":{"distinct":false,"ordered":true,"bindings":[{"annotation"
	   :{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#1-1"},"position":{"value":"1
	   .1"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_26092"},"prefix":{"value":""},"exact":{"value"
	   :"Phthalates"},"postfix":{"value":" in Fast Food: A Potential Dietary Sourc"},"pmcid":"PMC5047790"},
	   {"annotation":{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#2-2"
	   },"position":{"value":"2.2"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_22901"},"prefix":{"value"
	   :"ood Consumption and "},"exact":{"value":"Bisphenol"},"postfix":{"value":" A and Phthalates Ex"},"pmcid"
	   :"PMC5047790"}]}}
*/
try {
	
	String pmcid= request.getParameter("pmcid");
	
	if (pmcid!=null){
		pmcid = pmcid.toUpperCase();
		if ((pmcid.split(" ").length==1) && (pmcid.startsWith("PMC")==false)){
			pmcid = "PMC"+pmcid;
		}
	}
	
	if (pmcid!=null){
    	//@TODO You need to change this value to some API address to retrive annotations for the specific PMCID
    	String  reqUrl= "http://myServer/getAnnotations/"+pmcid;
    	
	    URL url = new URL(reqUrl);
	    HttpURLConnection con = (HttpURLConnection)url.openConnection();
	    con.setDoOutput(true);
	    con.setRequestMethod(request.getMethod());
	    int clength = request.getContentLength();
	    if(clength > 0) {
	        con.setDoInput(true);
	        byte[] idata = new byte[clength];
	        request.getInputStream().read(idata, 0, clength);
	        con.getOutputStream().write(idata, 0, clength);
	    }
	    response.setContentType(con.getContentType());
	
	    BufferedReader rd = new BufferedReader(
	            new InputStreamReader(con.getInputStream(), "UTF-8"));
	    String line;
	    StringBuilder res= new StringBuilder();
	    while ((line = rd.readLine()) != null) {
	        out.println(line);
	        res.append(line);
	    }
	    rd.close();
    
	}

} catch(Exception e) {
    e.printStackTrace();
    response.setStatus(500);
}
%>
