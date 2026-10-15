# Getting started
```bash
go run . serve
```

# Development 
Test super user :
```
admin@test.local
test1234admin
```

Fill the dev database with fake activities (`seed.go`). It owns them as `seed@test.local`, replaces the
ones a previous run made, and refuses to run on a built binary :
```bash
go run . seed --count 20
```

Update the version of pocketbase :
```
go get -u github.com/pocketbase/pocketbase@latest
go mod tidy
```
Get the current version :
```
go list -m github.com/pocketbase/pocketbase
```

## Migrations
Migrate changes :
```bash
go run . migrate create 
```

Migrate all collections :
```bash
go run . migrate collections
```

Generate typescript types :
```bash
npx pocketbase-typegen --url http://127.0.0.1:8090 --email admin@test.local --password 'test1234admin'
```