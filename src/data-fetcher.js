import axios from 'axios'
//  intended logic- const GetData = async (bbox) => {
// const res = await axios.get(`http://www.overpass-api.de/api/xapi?node[amenity=school][bbox=(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]})]`)
const GetData = async () => {
    const res = await axios.get("http://www.overpass-api.de/api/xapi?*[amenity=school][bbox=(144.9682, -37.792899999999996, 144.98819999999998, -37.7729)]")
    // This request returns a huge text file, with many nodes and ways entities. they can't all be different schools. 
    //  so I counted only the ones that include [ k="amenity" v="school"], and i got 64, which still seems too many...
    let count = (res.data.match(/k="amenity" v="school"/g) || []).length;
    console.log("count", count);
}

export default GetData;

