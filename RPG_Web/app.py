from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from models import Classe
import random

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rpg_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

def rolarDadosLogica(quantidade, faces, bonus):

    rolagens = []
    somaDados = 0

    for _ in range(quantidade):
        resultado = random.randint(1, faces)
        rolagens.append(resultado)
        somaDados += resultado

    totalFinal = somaDados + bonus

    return {
        "formula": f"{quantidade}d{faces}+{bonus}",
        "rolagensIndividuais": rolagens,
        "somaDados": somaDados,
        "bonus": bonus,
        "totalFinal": totalFinal,
        "critico": 20 in rolagens if faces == 20 else False,
        "falhaCritica": 1 in rolagens if faces == 20 else False
    }

@app.route('/')
def home():
    return jsonify({"status": "API do RPG Online!"})

@app.route('/rolar', methods=['POST'])
def rolarApi():
    dados = request.get_json()

    qtd = dados.get('qtd', 1)
    faces = dados.get('faces', 20)
    bonus = dados.get('bonus', 0)

    resultado = rolarDadosLogica(qtd, faces, bonus)

    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)