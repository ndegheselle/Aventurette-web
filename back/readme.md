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