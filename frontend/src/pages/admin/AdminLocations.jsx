import  { useEffect, useState  } from "react"
import { getVehicles, deleteVehicle, updateVehicleStatus, getLocations } from "../../services/adminApi";

export default function AdminLocations() {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        getLocations().then(setLocations);
    }, [])
    
};

return {

}