var bookingdetails = [{
        "ID": 100,
        "CustomerName": "Rahul",
        "Date": "15/06/2020",
        "StartTime": "18:00",
        "EndTime": "22:00"
    },
    {
        "ID": 102,
        "CustomerName": "Mahesh",
        "Date": "04/04/2019",
        "StartTime": "09:00",
        "EndTime": "20:00"

    },
    {
        "ID": 100,
        "CustomerName": "Rahul",
        "Date": "15/06/2020",
        "StartTime": "18:00",
        "EndTime": "22:00"
    },
];
var createroomdata = [{
    "ID": 104,
    "numberofseats": 6,
    "amenities": ["bed", "TV", "NON-A/C", "Locker", "Bathroom"],
    "PricePerHour": "Rs.250",
    "RoomName": "Room No.104",
    "BookedStatus": "No",
    "CustomerName": "null",
    "Date": "null",
    "StartTime": "null",
    "EndTime": "null"
}, {
    "ID": 105,
    "numberofseats": 3,
    "amenities": ["bed", "TV", "A/C", "Locker", "Bathroom", "Balcony"],
    "PricePerHour": "Rs.350",
    "RoomName": "Room No.105",
    "BookedStatus": "No",
    "CustomerName": "null",
    "Date": "null",
    "StartTime": "null",
    "EndTime": "null"
}]
var bookingidtracker = 0;
var createroomtracker = 0;

const express = require("express");
const mongodb = require("mongodb");
const app = express();
const bodyParser = require("body-parser");
const mongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017";
app.use(bodyParser.json());
app.get("/bookeddata", function(req, res) {
    mongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db("hallbooking");
        var cursor = db.collection("rooms").find({ "BookedStatus": "Yes" }).toArray();
        cursor.then(function(data) {
            let result = [];
            for (var i = 0; i < data.length; i++) {
                result.push({
                    "Room Name": data[i].RoomName,
                    "Booked Status": "Yes",
                    "Customer Name": data[i].CustomerName,
                    "Date": data[i].Date,
                    "StartTime": data[i].StartTime,
                    "EndTime": data[i].EndTime
                });
            }
            res.send(result);
            client.close();
        });
    });
});
app.get("/customerdata", function(req, res) {
    mongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db("hallbooking");
        var cursor = db.collection("rooms").find({ "BookedStatus": "Yes" }).toArray();
        cursor.then(function(data) {
            var result = [];
            for (let i = 0; i < data.length; i++) {
                result.push({
                    "Customer Name": data[i].CustomerName,
                    "Room Name": data[i].RoomName,
                    "Date": data[i].Date,
                    "Start Time": data[i].StartTime,
                    "End Time": data[i].EndTime
                })
            }
            res.send(result);
            client.close();
        });
    })
})
app.put("/booking", function(req, res) {
    mongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db("hallbooking");
        var jsonDatatoCheck = bookingdetails[bookingidtracker];
        // console.log(jsonDatatoCheck);
        var data;
        var ID;
        var cursor = db.collection("rooms").find({ "ID": 100 }).toArray();
        cursor.then(
            function(data) {
                var matched = false;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ID == bookingdetails[bookingidtracker].ID) {
                        if (data[i].BookedStatus == "Yes") {
                            var StartTime = data[i].StartTime.split(":");
                            var EndTime = data[i].EndTime.split(":");
                            var StartTimeforbooking = bookingdetails[bookingidtracker].StartTime.split(":");
                            var EndTimeforbooking = bookingdetails[bookingidtracker].EndTime.split(":");
                            if (data[i].Date == bookingdetails[bookingidtracker].Date && (Number(StartTime[0]) >= Number(StartTimeforbooking[0]) || Number(EndTime[0]) <= Number(EndTimeforbooking[0]))) {
                                matched = true;
                                break;
                            }
                        }
                    }
                }
                if (!matched) {
                    console.log("hooo");
                    db.collection("rooms").updateOne({ "ID": bookingdetails[bookingidtracker].ID }, { $set: { "BookedStatus": "Yes", "CustomerName": bookingdetails[bookingidtracker].CustomerName, "Date": bookingdetails[bookingidtracker].Date, "StartTime": bookingdetails[bookingidtracker].StartTime, "EndTime": bookingdetails[bookingidtracker].EndTime } },
                        function(err, data) {
                            bookingidtracker++;
                            res.json({
                                "message": "modified",
                            });
                            client.close();
                        }
                    )
                } else {
                    res.json({ message: "Room has been booked for specified date and time" });
                }

            }
        )

    });
})
app.post("/CreateRoom", function(req, res) {
    mongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db("hallbooking");
        var findData = db.collection("rooms").find({ "ID": createroomdata[createroomtracker].ID }).toArray();
        findData.then(function(data) {
            for (let i = 0; i < data.length; i++) {
                db.collection("rooms").deleteOne(data[i]);
            }
        });
        db.collection("rooms").insertOne(createroomdata[createroomtracker],
            function(err, data) {
                createroomtracker++;
                res.send(data);
                client.close();
            });
    })
})


app.listen(3000);