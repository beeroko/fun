# Fun server

## Install sqlite3

```sh
sudo apt update
sudo apt install curl
sudo apt install sqlite3
```

## Install NVM & NodeJS & Yarn

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

```sh
source ~/.bashrc
```

```sh
nvm install --lts
```

```sh
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

```sh
sudo apt update
sudo apt install --no-install-recommends yarn
```

##


## Install dependencies

```bash
yarn
```

## Create database

Create file `db.db` in root directory.

Run sqlite3 CLI:

```sh
sqlite3
```

Execute SQL script:

```sql
CREATE TABLE users (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  username TEXT(25) NOT NULL,
  email TEXT(50) NOT NULL,
  password TEXT(25) NOT NULL, 
  token TEXT(255)
);
```

## Start server

```bash
yarn start
```