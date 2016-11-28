<%@page session="false"
    import="java.net.*,java.io.*"
%><%
try {
	
	String pmcid= request.getParameter("pmcid");
	String type= request.getParameter("type");
	
	if (pmcid!=null){
		pmcid = pmcid.toUpperCase();
		if ((pmcid.split(" ").length==1) && (pmcid.startsWith("PMC")==false)){
			pmcid = "PMC"+pmcid;
		}
	}
	
	if (pmcid!=null){
		String reqUrl;
		    
	    if (("europepmc").equals(type)){
	    	//reqUrl contains some API address to retrive annotations for a specific pmcid
	    	reqUrl= "http://wwwint.ebi.ac.uk/europepmc/rdf/sparql?default-graph-uri=&query=PREFIX+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0APREFIX+oa%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Foa%23%3E%0D%0APREFIX+dcterms%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0D%0A%0D%0ASELECT+%3Fannotation+%3Fposition+%3Ftag+%3Fprefix+%3Fexact+%3Fpostfix+%3Fsource+WHERE+%7B%0D%0A++%0D%0A%3Fannotation+oa%3AhasBody+%3Ftag.%0D%0A%3Fannotation+oa%3AhasTarget+%3Ftarget.%0D%0A%0D%0A%3Ftarget+oa%3AhasSource+%3Chttp%3A%2F%2Feuropepmc.org%2Farticles%2F{pmcid}%3E+.%0D%0A%3Ftarget+oa%3AhasSource+%3Fsource+.%0D%0A%3Ftarget+oa%3AhasSelector+%3Fselector.%0D%0A%0D%0A%3Fselector+oa%3Aexact+%3Fexact.%0D%0A%3Fselector+oa%3Apostfix+%3Fpostfix.%0D%0A%3Fselector+oa%3Aprefix+%3Fprefix.%0D%0A++%0D%0ABIND+%28replace%28strafter%28str%28%3Fannotation%29%2C+%22%23%22%29%2C+%22-%22%2C+%22.%22%29+as+%3Fposition%29%0D%0A%0D%0A%7D+ORDER+BY+%3Fposition%0D%0A&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
	    	
	    }
		    
	    reqUrl = reqUrl.replace("{pmcid}", pmcid);
	
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
