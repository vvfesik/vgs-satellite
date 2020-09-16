function emberModelToJson(route: object | null) {
  let json: object | null;

  try {
    json = JSON.parse(JSON.stringify(route));
  } catch (error) {
    json = error.message;
  }

  return json;
}

export default emberModelToJson;
