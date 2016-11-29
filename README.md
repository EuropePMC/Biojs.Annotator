# Biojs.Annotator

 This is a basic component to annotate text mining terms connected to different semantic types inside an HTML page containing an article full text identified by a PMCID parameter.
 Different users need to change it in order to tailor it to their requirements.
 The annotations are retrieved through an AJAX call to a back-end page (see the proxyUrl option in the section below) that will retrieve somehow the annotations for the PMCID specified. An example of typical back-end page is annotation_biojs.jsp inside the folder java.
 The components is expecting this back-end page to return the annotations for the PMCID specified in the following JSON format :
 ```javascript
 {"pmcId":"PMC5047790","results":{"distinct":false,"ordered":true,"bindings":[{"annotation"
:{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#1-1"},"position":{"value":"1
.1"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_26092"},"prefix":{"value":""},"exact":{"value"
:"Phthalates"},"postfix":{"value":" in Fast Food: A Potential Dietary Sourc"},"pmcid":"PMC5047790"},
{"annotation":{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#2-2"
},"position":{"value":"2.2"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_22901"},"prefix":{"value"
:"ood Consumption and "},"exact":{"value":"Bisphenol"},"postfix":{"value":" A and Phthalates Ex"},"pmcid"
:"PMC5047790"}]}}
 ```

## Example of use

You can see the files under the folder /examples/FulltextPage.html for a simple example of usage

```javascript
             var annotator = new Biojs.Annotator({
				target: 'fulltext_container',  
				pmcId: 'PMC5047790',
				proxyUrl:"../java/annotation_biojs.jsp",
				idLegend: 'legend_container'
		    });	
		    /**triggers the annotations retrieval process*/
			annotator.load();

```

## Options

@param {Object} options An object with the options for the Annotator component.
   
@option {string} [target='fulltext_container']
   Identifier of the DIV tag where the article text inside the HTML page is contained. It is a mandatory parameter.
  
@option {string} [pmcId='PMC5047790']
   PMCID of the full text article that is displayed into the HTML page and that we want to annotate. It is a mandatory parameter.

@option {string} [idLegend='legend_container']
   Identifier of the div that will contain the legend displaying all the semantic types found in the article with the possibility for the user to enable/disable their highlighting. It is a mandatory parameter.
  
@option {string} [proxyUrl='../java/annotation_biojs.jsp']
   Contains the path to the back-end page used to retrieve the annotations for the PMCID specified. It is a mandatory parameter.


## License 

This software is licensed under the Apache 2 license, quoted below.

Copyright (c) 2016, EuropePMC

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.

