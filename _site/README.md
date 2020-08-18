# Graph visualisation 

This repo is for the development of improved graph visualisation ideas and eventually integration of these into SOP. 

# Task 1: Switch between representations for a graph

## Pre-conditions
1.  pizza\_prov_out.ttl  A prov-o graph (example supplied - note I will test with a different example)

## Task 

1. Display a provenance graph for some workflow using a Sankey diagram see: [https://observablehq.com/@d3/sankey-diagram] and prov-o-viz [https://link.springer.com/chapter/10.1007%2F978-3-319-16462-5_18] 
1. Create a configurable menu of options when you click on an activity in the graph.
1. Create action to switch to a force-directed graph (e.g. throw up a popup, switch tabs etc) [https://bl.ocks.org/mbostock/1062288] - the actual graph can be arbitrary at this stage
1. Render graph with support default options for which nodes are open and which are collapsed, by node type, and configuration for node type base styling of nodes.
1. Review (collaboratively) after exercise to look at some real world examples and develop some ideas for optimum design

## Goal
Familiarity with the D3 environment, and the general nature of different "shapes" of graphs needing complementary approaches.

### Stretch goal:

The provoviz.org functionality  is "activity centric" (choose an Activity and it builds the graph) - Surround will have an "entity-centric" view of the world. Each entity will be subject to a range of different activity types - some of them less interesting than others. The optional "stretch goal" would be to be able to control the styling of objects based on the sub-type of entity and activity, and potentially filter the graph to include or exclude such subtypes - i.e. we might want to show just the validation steps applied to a workflow.

## Output
Files checked into this repository and instructions for running the visualisation examples.

# Task 2: querying real RDF graphs
Still under construction...

## Purpose:
Demonstrate an ability to grasp concepts of RDF graphs, query with SPARQL and transform to a visualisation paradigm. This is a fairly simple task, but requires good communication to deal with the range of components in the stack, get help when needed and report results usefully.

## Task: 

Convert static data examples into queries against a graph database. (GraphQL and JSON response).




## Pre-conditions :
1.  pizza\_prov_out.ttl  A prov-o graph (example supplied - note I will test with a different example)
1.  prov-viz.ui.ttlx A TopQuadrant SWP (sparql Web Page)  stub that takes this graph and produces JSON) 
- invoked by []http://localhost:8083/tbl/swp?_viewClass=pv:ProvVizService&fileName=X]
1. http://provoviz.org/ example online 
1. D3.js javascript library "Sankey" library

## Post-conditions :
1. SWP updated to generate a sankey diagram from the sample data
1. fileName parameter used to specify a specific graph 
1. Code checked into git
1. this README updated with a clickable link to TopBraid Composer running local EDG

## Description :

Generate SPARQL queries against the RDF example to generate the json objects needed to configure the graph. Embed these and suitable hooks in the SWP page to drive the d3 sankey module to create an appropriate visualisation.

You can execute SPARQL manually against the prov example. 

The prov-o graph will import the prov-o ontology, and some specialisations of this (a Surround ontology for specialised prov types).

## Skills :
This is a minimal introduction to RDF, SPARQL and TopBraid - and requires some basic HTML and Javascript to join the pieces together, and basic git process. These skills will be required for future outputs based on MachineLearning processes generating data, and integration of that data into a knowledge base and then presentation via multiple reporting options, including dashboards, spreadsheets, logs, etc.


SELECT ?l ?e2
WHERE {
?ent a prov:Entity .
?ent rdfs:label ?l .
?ent prov:wasDerivedFrom/rdfs:label ?e2
}


            SELECT ?l ?e2
            WHERE {
                ?ent a prov:Entity .
                ?ent rdfs:label ?l .
                ?ent prov:wasDerivedFrom/rdfs:label ?e2 .
            }
            ORDER BY (?l) }">
        <li>{= ?l } was derived from {= ?e2 }</li>
		
		
		
SELECT ?l ?e2
WHERE {
?ent a prov:Entity .
?ent rdfs:label ?l .
?ent prov:wasDerivedFrom/rdfs:label ?e2
}

SELECT ?deduction ?entity1 ?deduction3 ?entity ?entity4 ?transformation ?entity2
WHERE {
    ?deduction prov:wasInformedBy ?deduction3 .
    ?deduction3 prov:used ?entity4 .
    ?entity4 prov:wasDerivedFrom ?entity1 .
    ?entity4 prov:wasGeneratedBy ?transformation .
    ?transformation prov:used ?entity .
    ?transformation prov:used ?entity1 .
    ?entity2 prov:wasGeneratedBy ?deduction .
    ?entity2 owl:imports ?entity4 .
    ?entity2 prov:wasDerivedFrom ?entity4 .
}
