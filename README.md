# Config API

API for managing configurations

# Dependencies
1. MongoDB - Application database

# Quick Start
1. Clone the repository (git clone https://github.com/Monotype/MLSCoreService.git).
2. To run the application, you will have to get the config file from one of the contributors. The file has not been checked in as it contains sensitive information.
3. Switch to application directory. 
4. Run `npm install`.
5. Change the configurations for [Dependencies](#dependencies) in `/config/default.json`
6. Run `npm run start`.
7. Service should now be running at http://localhost:4000.
8. You can browse through the api documentation at http://localhost:4000/api/docs.

# Dependencies
- **MongoDB Configuration**
- - ```javascript
        "db": {
        "url": "mongodb://localhost:27017/config-api"
    }
    ```

# Running Tests
`npm run test`

# Coverage
`npm run coverage`

# Complexity
`npm run complexity`

# Linting
`npm run lint`

# Linting auto fix
`npm run lint-fix`

# Node security project
`npm run nsp`

# Directory Structure
- index.js
- lib/
- test/
- controllers/
- swagger/
- config/
- modules/
- - `{your-module-name}`/
- - - models/
- - - helpers/

# People
[Contributors](https://github.com/chirag-vashisht/config-api/graphs/contributors)

# Release Notes
**Release 0.0.0**