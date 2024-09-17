//import necessary datasets
var gfd=ee.ImageCollection('GLOBAL_FLOOD_DB/MODIS_EVENTS/V1');
var countries=ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var dem=ee.Image('USGS/SRTMGL1_003'); //elevation dataset
var precipitation=ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY');//CHIRPS precipitation data
var soilMoisture=ee.ImageCollection('NASA_USDA/HSL/SMAP10KM_soil_moisture');//soil moisture dataset
var landCover=ee.ImageCollection('MODIS/061/MCD12C1');//land cover dataset
var water=ee.Image('JRC/GSW1_4/GlobalSurfaceWater'); //JRC Global Surface Water

//Filter for Kenya
var kenya=countries.filter(ee.Filter.eq('country_na', 'Kenya'));

//Function to filter flood data by date
function filterFloodsByDate(startDate, endDate){
    return fgd.filterBounds(kenya).filter(ee.Filter.date(startDate, endDate));

}

//function to calculate Flood Frequency
function calculateFloodFrequency(floodCollection){
    return floodCollection.select('flooded').sum().divide(floodCollection.size());
}


//Set date range for flood analysis
var startDate='2000-01-01';
var endDate='2023-12-31';


//Filter floods and calculate frequency
var floodKenya=filterFloodsByDate(startDate, endDate);
var floodFrequency=calculateFloodFrequency(floodKenya).clip(kenya);//Clip to Kenyan borders

//Generate water mask from the JRC Global Surface Water datase
var waterMask=water.select('occurence').gt(50).clip(kenya); //Permanent water bodies (water occurence .50%)

//Mask the flood frequency by removing permanent water bodies
var floodFrequencyMasked=floodFrequency.updateMask(waterMask.not());

//visualization parameters for flood frequency
var floodVis={
    min:0,
    max:1,
    palette:['00ff00', '32cd32', '98fb98', 'add8e6', '87ceeb', '4682b4','1e90ff', '0000ff','00008b']//Green to Blue palette
};


//Visualization parameters for water bodies
var waterVis={
    palette:['0000ff'], //Blue colour for water bodies
    opacity:0.4  //Slightly transparent to differentiate from floods
};


//additional layers
var elevationKenya=dem.select('elevation').clip(kenya);
var recentPrecipitation=precipitation.filter(ee.Filter.date('2023-01-01', '2023-12-31')).mean().clip(kenya);
var recentSoilMoisture=soilMoisture.select('ssm').filter(ee.Filter.date('2023-01-01', '2023-12-31')).mean().clip(kenya);
var landCoverKenya=landCover.select('Majority_Land_Cover_Type_1').first().clip(kenya);//Updated to use the correct band name

//Updated Visualization Parameters
var elevationVis={min:0, max:3000, palette:['006600', '002200', 'fff700', 'ab7634','c4d0ff', 'ffffff']};
var precipitationVis={min:0, max:10, palette:['ffffff', 'ffcccc','ff6666', 'ff0000','800000']}; //White to Red for precipitation
var soilMoistureVis={min:0, max:0.5, palette:['f4e3d7', 'd2b48c','8b4513','4b2e15']}; //Light Brown to dark Brown for soil moisture
var landCoverVis={
    min:1, max:17,
    palette:['aec3d4', '162103', '235123','399b38', '38eb38','39723b','6a2325', 'ba7c3c', 'd99125','b5d9ff','92c5de', 'f1f1f1', 'e3a3cc','cdbadc','cc0013','33280d','d7cdcc','f7e174']
    
};


//set up the map
Map.setOptions('HYBRID');
Map.centerObject(kenya,6);

//add flood frequency layer and additional layers to the map
Map.addLayer(floodFrequencyMasked, floodVis, 'Flood Frequency');
Map.addLayer(waterMask.selfMask(), waterVis, 'Water Bodies');
Map.addLayer(elevationKenya, elevationVis, 'Elevation');
Map.addLayer(recentPrecipitation, precipitationVis, 'Precipitation');
Map.addLayer(recentSoilMoisture, soilMoistureVis, 'Soil Moisture');
Map.addLayer(landCoverKenya, landCoverVis, 'Land Cover');
Map.addLayer(kenya, {color:'black'}, 'Kenya Boundaries');

//create a panel to hold the legend
var legend=ui.Panel({
    style:{
        position: 'bottom-left',
        padding: '8px 15px'
    }
});


//function to generate a color bar for the legend
function makeColorBar(palette, min, max, title){
    var colorBar=ui.Thumbnail({
        image:ee.Image.pixelLonLatt().select(0),
        params:{
            bbox:[0,0,1,0.1],
            dimensions:'100x100',
            format:'png',
            min:0,
            max:1,
            palette:palette,
        },
        style:{stretch:'horizontal', margin:'0px 8px', maxHeight:'24px'},
    });
    var legendLabels=ui.Panel({
        widgets:[
            ui.Label(min, {margin: '4px 8px'}),
            ui.Label((min+max)/2, {margin: '4px 8px', textAlign:'center', stretch:'horizontal'}),
            ui.Label(max, {margin:'4px 8px'})
        ],
        layout: ui.Panel.Layout.flow('horizontal')
    });

    var legendTitle=ui.label({
        value:title,
        style:{fontWeight:'bold'}
    });

    var legendPanel=ui.Panel([legendTitle, colorBar, legendLabels]);
    return legendPanel;
}

//add legends for each layer
legend.add(makeColorBar(floodVis.palette, floodVis.min, floodVis.max, 'Flood Frequency'));
legend.add(makeColorBar(elevationVis.palette, elevationVis.min, elevationVis.max, 'Elevation (m)'));
legend.add(makeColorBar(precipitationVis.palette, precipitationVis.min, precipitationVis.max, 'Precipitation(mm)'));
legend.add(makeColorBar(soilMoistureVis.palette, soilMoistureVis.min, soilMoistureVis.max, 'Soil moisture (m³/m³)'));
legend.add(makeColorBar(landCoverVis.palette, landCoverVis.min, landCoverVis.max, 'Land Cover Type'));

//add legend to map
Map.add(legend);

//calculate and print the percentage of Kenya affected by flooding
function calculateFloodingPercentage(floodFrequency, region){
    var floodedArea=floodFrequency.gt(0).multiply(ee.Image.pixelArea()).reduceRegion({
        reducer:ee.Reducer.sum(),
        geometry:region,
        scale:1000,
        maxPixels:1e9
    });
    var floodedPercent=ee.Number(floodedArea.get('flooded')).divide(totalArea.get('area')).multiply(100);

    var roundedPercent=floodedPercent.round();
    var formattedPercent=ee.String(roundedPercent).cat(ee.Algorithms.If(roundedPercent.mod(1).eq(0),'.00', ee.Algorithms.If(roundedPercent.multiply(10).mod(1).eq(0), '0',)));
    return formattedPercent;

}
var formattedPercent=calculateFloodedPercentage(floodFrequencyMaked, kenya);
print('Percentage of Kenya affected by flooding:', formattedPercent, '%');
