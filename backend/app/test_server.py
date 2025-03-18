import requests

# Test the server endpoints

# Test pre-seeded items
print(requests.get("http://localhost:8000/items/").json())

# Test fetching all survivors
print(requests.get("http://localhost:8000/survivors/").json())

# Test fetching Testington - should not be in the db yet
print(requests.get("http://localhost:8000/survivors/Testington").json())

# Test adding Testington
# print(requests.post("http://localhost:8000/survivors/", json={
#     "name": "Testington",
#     "age": 30,
#     "gender":"m",
#     "lastLocation": {
#         "latitude": 55.96061252635802,
#         "longitude": 12.503111911870166
#     },
#     "inventory": {}
#     }).json())

# Clean up the test survivor
# print(requests.delete("http://localhost:8000/survivors/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed/").json())