const locationsToBoundingBox = (latitude, longitude, padding = 0.01) => {

    const bounding_box = [, , ,]
    bounding_box[0] = Math.min(bounding_box[0] || longitude, longitude) - padding
    bounding_box[1] = Math.min(bounding_box[1] || latitude, latitude) - padding
    bounding_box[2] = Math.max(bounding_box[2] || longitude, longitude) + padding
    bounding_box[3] = Math.max(bounding_box[3] || latitude, latitude) + padding

    // if using overpass turbo:
    // bounding_box[1] = Math.min(bounding_box[1] || longitude, longitude) - padding // west
    // bounding_box[0] = Math.min(bounding_box[0] || latitude, latitude) - padding // south
    // bounding_box[3] = Math.max(bounding_box[3] || longitude, longitude) + padding // east
    // bounding_box[2] = Math.max(bounding_box[2] || latitude, latitude) + padding // north

    return bounding_box
}

export default locationsToBoundingBox;
