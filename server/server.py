from flask import Flask,jsonify,request


app=Flask(__name__)


@app.route('/',methods=['GET'])
def home():
    return jsonify({"message":"Welcome to Alertic API"}),200


@app.route('/api/test',methods=['POST'])
def test():
    data =request.json
    name=data.get('name')
    sex=data.get('sex')
    huzz=data.get('huzz')

    return jsonify({"message":"Test API is working","data":{"name":name,"sex":sex,"huzz":huzz}}),200


if __name__=='__main__':
    app.run(debug=True,port=5000)