Database Design
===============

This document caputeres the database design of the PawPal application.  


From the Class-Diagramm
-----------------------

For the actual design of the databse system utilized in this application, the 
following tables were identified and the following entities derived from the 
class diagramm in the previously created High Level Design (HLD):  

**Core tables**  

- users  
- pet\_owners  
- pet\_sitters  
- admins  
- bookings  
- reviews  
- certification\_requests  

**Supporting / join tables**  

- favorites (owner <--> sitter)  
- pet\_types  
- owner\_pet\_types  
- sitter\_pet\_types  
- profile\_images  
- Enum types (PostgreSQL)  
- booking\_status (PENDING, ACCEPTED, DECLINED, COMPLETED)  
- request\_status (PENDING, APPROVED, REJECTED)  

**Entities**    

- User    
- PetOwner   
- PetSitter   
- Admin   
- Booking   
- Review   
- CertificationRequest   
- PetType   
- ProfileImage   
- Favorite   

**Constraints**  

- Review.booking\_id UNIQUE (one review per booking)  
- Favorite(owner\_id, sitter\_id) UNIQUE  


Possible Entity Relationship Model
----------------------------------

From the above extraction of entities and tables, we can create a possible 
Entity Relationship (ER) Model. 

### User
| Attribute         | Type   | Notes                    |
|------------------|--------|-------------------------|
| user\_id           | PK     | Base user identifier     |
| email             | String | UNIQUE                  |
| password\_hash     | String |                         |
| registration\_date | Date   |                         |

### PetOwner
| Attribute | Type   | Notes                  |
|-----------|--------|-----------------------|
| user\_id   | PK, FK | -> User.user\_id        |
| username  | String |                       |
| about\_text| Text   |                       |

### PetSitter
| Attribute       | Type   | Notes                                   |
|----------------|--------|----------------------------------------|
| user\_id         | PK, FK | -> User.user\_id                          |
| username        | String |                                        |
| about\_text      | Text   |                                        |
| average\_rating  | Double | Derived                                |
| is\_certified    | Boolean| Derived from CertificationRequest      |

### Admin
| Attribute | Type   | Notes                  |
|-----------|--------|-----------------------|
| user\_id   | PK, FK | -> User.user\_id        |

### Booking
| Attribute     | Type   | Notes                            |
|---------------|--------|---------------------------------|
| booking\_id    | PK     |                                 |
| owner\_id      | FK     | -> PetOwner.user\_id              |
| sitter\_id     | FK     | -> PetSitter.user\_id             |
| status        | Enum   | BookingStatus                   |
| request\_date  | Date   |                                 |
| details       | Text   |                                 |

### Review
| Attribute   | Type | Notes                                      |
|------------|------|--------------------------------------------|
| review\_id   | PK   |                                            |
| booking\_id  | FK, UNIQUE | -> Booking.booking\_id (one review per booking) |
| rating      | Int  |                                            |
| text        | Text |                                            |

### CertificationRequest
| Attribute       | Type | Notes                                   |
|-----------------|------|----------------------------------------|
| request\_id      | PK   |                                        |
| sitter\_id       | FK   | -> PetSitter.user\_id                     |
| admin\_id        | FK   | -> Admin.user\_id                         |
| status          | Enum | RequestStatus                            |
| submission\_date | Date |                                        |

### PetType
| Attribute    | Type   | Notes      |
|--------------|--------|-----------|
| pet\_type\_id  | PK     |           |
| name         | String | UNIQUE    |

### OwnerPetType
| Attribute    | Type   | Notes                      |
|--------------|--------|---------------------------|
| owner\_id     | PK, FK | -> PetOwner.user\_id         |
| pet\_type\_id  | PK, FK | -> PetType.pet\_type\_id      |

### SitterPetType
| Attribute    | Type   | Notes                      |
|--------------|--------|---------------------------|
| sitter\_id    | PK, FK | -> PetSitter.user\_id        |
| pet\_type\_id  | PK, FK | -> PetType.pet\_type\_id      |

### Favorite
| Attribute    | Type   | Notes                      |
|--------------|--------|---------------------------|
| owner\_id     | PK, FK | -> PetOwner.user\_id         |
| sitter\_id    | PK, FK | -> PetSitter.user\_id        |

### ProfileImage
| Attribute  | Type   | Notes               |
|------------|--------|-------------------|
| image\_id   | PK     |                   |
| user\_id    | FK     | -> User.user\_id    |
| image\_url  | String |                   |
