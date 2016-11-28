
Biojs.AnnotatorBase = Biojs.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
	},
	
	opt: {
	  
	},
	
	 /**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
	],
	
	_startsWith: function (str, prefix){
		return str.indexOf(prefix) == 0;
	},
	
	_endsWith: function (str, suffix){
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	},
	
	_getAnnotationTypeGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationType(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationTextGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationText(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrl(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUriGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUri(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlEPMCsearchGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrlEPMCsearch(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationUrlEPMCsearchRefineGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationUrlEPMCsearchRefine(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationLabelGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationLabel(this._getAnnotationTypeGeneral(annotation, className));
	      }
	      
	      return "";
	},
	
	_getAnnotationProviderGeneral: function(className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationProvider();
	      }
	      
	      return "";
	},
	
	_getAnnotationBodyGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationBody(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationDetailsLinkGeneral: function(className, type, url){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationDetailsLink(type, url);
	      }
	      
	      return "";
	},
	
	_getAnnotationPrefixGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationPrefix(annotation);
	      }
	      
	      return "";
	},
	
	_getAnnotationPostfixGeneral: function(annotation, className){
		 var annotator= this._getAnnotator(className);
		 
	      if (annotator!=null){
	    	  return annotator._getAnnotationPostfix(annotation);
	      }
	      
	      return "";
	},
	
	
	_getAnnotator: function(className){
		var annotator=null;
	      if (className==Biojs.AnnotatorBase.CLASSNAME_RDF){
	    	  annotator = new Biojs.Annotator({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_EVENT){
	    	  annotator = new Biojs.AnnotatorEvent({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_GENE_REF){
	    	  annotator = new Biojs.AnnotatorGeneRef({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_OPEN_TARGET){
	    	  annotator = new Biojs.AnnotatorOpenTarget({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_DISGENET){
	    	  annotator = new Biojs.AnnotatorDisgenet({});
	      }else if (className==Biojs.AnnotatorBase.CLASSNAME_NCBI){
	    	  annotator = new Biojs.AnnotatorNCBI({});
	      }
	      
	      return annotator;
	}
	

	
},{
	 //List of possible annotation types
	GENES_PROTEINS:"GENES_PROTEINS",
	ACCESSION_NUMBERS:"ACCESSION_NUMBERS",
	ORGANISMS:"ORGANISMS",
	CHEMICALS:"CHEMICALS",
	GO_TERMS:"GO_TERMS",
	DISEASE:"DISEASE",
	EFO:"EFO",	
	CLASSNAME_RDF:"AnnotatorBase",
	CLASSNAME_EVENT:"Event",
	CLASSNAME_GENE_REF:"GeneRef",
	CLASSNAME_OPEN_TARGET:"OpenTarget",
	CLASSNAME_DISGENET:"DisGenet",
	CLASSNAME_NCBI:"Ncbi",
	PHOSPHORYLATE_NACTEM:"PHOSPHORYLATE_NACTEM",
	GENE_REF:"GENERIF",
	OPEN_TARGET:"OPEN_TARGET",
	DISGENET:"DISGENET",
	NCBI:"NCBI",
	//Events 
	EVT_ON_ANNOTATIONS_LOADED: "onAnnotationsLoaded",
	EVT_ON_REQUEST_ERROR: "onRequestError"
});