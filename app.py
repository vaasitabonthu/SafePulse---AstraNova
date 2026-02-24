from flask import Flask, render_template, request, redirect

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("auth.html")

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form['name']
    role = request.form['role']
    area = request.form['area']

    print(f"{name} signed up as {role} in {area}")

    return redirect('/login')  # after signup go to login page


@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        name = request.form['name']
        role = request.form['role']
        area = request.form['area']
        access_code = request.form['access_code']

        print(f"{name} logged in as {role} in {area}")

        # Later we validate access_code from database
        return "Login Successful!"

    return render_template("login.html")

@app.route('/login', methods=['POST'])
def login():
    role = request.form['role']
    name = request.form['name']

    if role == "worker":
        return redirect(f"/worker_home?name={name}")
    else:
        return "Supervisor dashboard coming soon"