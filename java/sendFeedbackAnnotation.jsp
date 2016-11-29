<%@page session="false"
    import="java.util.*, java.text.SimpleDateFormat"
%><%

/**
	This back-end page is an example of page used to send feedback about annotations provided by users. It is accepting the input parameters below. It is necessary to customize the piece of code responsible for sending emails or any other type of notifications at the end of the page
*/

String message= request.getParameter("feedback_message");
String judge= request.getParameter("judge");
String semanticType= request.getParameter("semantic_type");
String exact= request.getParameter("exact");
String prefix= request.getParameter("prefix");
String postfix= request.getParameter("postfix");
String pmcid=request.getParameter("pmcid");
String userEmail=request.getParameter("email");
String uri= request.getParameter("uri");
String body= request.getParameter("body");
SimpleDateFormat date = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
String timestamp = date.format(new Date());
String hostName=SystemUtils.getHostName();
String isAbstract= request.getParameter("isAbstract");
String src= request.getParameter("src");
String extId= request.getParameter("ext_id");


	String htmlMessage="<table>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">HOSTNAME</td><td>"+hostName+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">TIMESTAMP</td><td>"+timestamp+"</td></tr>";
	
	if ("0".equalsIgnoreCase(isAbstract)){
		htmlMessage+="<tr><td style=\"font-weigth:bold\">ARTICLE</td><td><a href=\"http://europepmc.org/articles/"+pmcid+"\">http://europepmc.org/articles/"+pmcid+"</a></td></tr>";
	}else{
		if ("HIR".equalsIgnoreCase(src)){
			htmlMessage+="<tr><td style=\"font-weigth:bold\">GUIDELINE</td><td><a href=\"http://europepmc.org/guidelines/"+src+"/"+extId+"\">http://europepmc.org/guidelines/"+src+"/"+extId+"</a></td></tr>";
		}else if ("PAT".equalsIgnoreCase(src)){
			htmlMessage+="<tr><td style=\"font-weigth:bold\">GUIDELINE</td><td><a href=\"http://europepmc.org/patents/"+src+"/"+extId+"\">http://europepmc.org/patents/"+src+"/"+extId+"</a></td></tr>";
		}else if ("ETH".equalsIgnoreCase(src)){
			htmlMessage+="<tr><td style=\"font-weigth:bold\">GUIDELINE</td><td><a href=\"http://europepmc.org/theses/"+src+"/"+extId+"\">http://europepmc.org/theses/"+src+"/"+extId+"</a></td></tr>";
		}else{
			htmlMessage+="<tr><td style=\"font-weigth:bold\">ABSTRACT</td><td><a href=\"http://europepmc.org/abstract/"+src+"/"+extId+"\">http://europepmc.org/abstract/"+src+"/"+extId+"</a></td></tr>";

		}
		
	}
	htmlMessage+="<tr><td style=\"font-weigth:bold\">JUDGE</td><td>"+judge+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">SEMANTIC TYPE</td><td>"+semanticType+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">TEXT ANNOTATION</td><td>"+exact+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">PREFIX</td><td>"+prefix+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">POSTFIX</td><td>"+postfix+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">USER EMAIL</td><td>"+userEmail+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">MESSAGE</td><td>"+message+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">URI</td><td>"+uri+"</td></tr>";
	htmlMessage+="<tr><td style=\"font-weigth:bold\">BODY</td><td>"+body+"</td></tr>";
	htmlMessage+="</table>";
	
	String subject="Annotation feedback NEGATIVE";
	
	if ("good".equalsIgnoreCase(judge)){
		subject="Annotation feedback POSITIVE";
	}
	
	/**
		TODO Insert here the code to send a user feedback email about the input annotation
	*/
	//MailSender.sendMessage(SearchConstants.EMAIL_FROM_ADDRESS, SearchConstants.EMAIL_ENGAGEMENT_TO_ADDRESS, subject, "", htmlMessage);

%>


