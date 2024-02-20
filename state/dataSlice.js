import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    digStorages: [],
    stepOrders: [],
    groupOrders: [],
    filterOrders: [],
    filterPlants: [],
    steps: [],
    token: [],
    currentStep: [],    
    currentStorageId: '',
    currentColorStep: '',
    searchText: '',
    dataChange: [],
    notifications: [],
    totalPlantQty: 0,
    totalOrderQty: 0,
    filterPlantQty: null,
    filterOrderQty: null,
    btPermission: []
}

export const dataSlice = createSlice({
    name: 'data_from_endpoint',
    initialState,
    reducers: {

        setDigStorages(state, action) {
            state.digStorages = action.payload.data
        },
        setSteps(state, action) {
            state.steps = action.payload.data
        },
        setToken(state, action) {
            state.token = action.payload
        },
        setStepOrders(state, action) {
            state.stepOrders = action.payload.data
        },
        setGroupOrders(state, action) {
            state.groupOrders = action.payload.data
        },
        setFilterOrders(state, action) {
            state.filterOrders = action.payload
        },
        setFilterPlants(state, action) {
            state.filterPlants = action.payload
        },
        setCurrentStep(state, action) {
            state.currentStep = action.payload
        },
        setBTPermission(state, action) {
            state.btPermission = action.payload
        },
        setStorageId(state, action) {
            state.currentStorageId = action.payload
        },
        setSearchText(state, action) {
            state.searchText = action.payload
        },
        setNotifications(state, action) {
            state.notifications = action.payload
        },
        setTotalQty(state, action) {
            state.totalOrderQty = action.payload.orders
            state.totalPlantQty = action.payload.plants
        },
        setFilterQty(state, action) {
            state.filterOrderQty = action.payload.orders
            state.filterPlantQty = action.payload.plants
        },
        setCurrentColorStep(state, action) {
            const colorStepBtn = {
                green: {
                    name: 'green',
                    color: '#00721B'
                },
                yellow: {
                    name: 'yellow',
                    color: '#1FBB43'
                },
                pink: {
                    name: 'pink',
                    color: '#83E499'
                },
                red: {
                    name: 'red',
                    color: '#C2DBC7'
                },
                purple: {
                    name: 'purple',
                    color: '#A8AFAA'
                }
            }
            switch (action.payload) {
                case colorStepBtn.green.name:
                    state.currentColorStep = colorStepBtn.green.color
                    break;
                case colorStepBtn.yellow.name:
                    state.currentColorStep = colorStepBtn.yellow.color
                    break;
                case colorStepBtn.pink.name:
                    state.currentColorStep = colorStepBtn.pink.color
                    break;
                case colorStepBtn.red.name:
                    state.currentColorStep = colorStepBtn.red.color
                    break;
                case colorStepBtn.purple.name:
                    state.currentColorStep = colorStepBtn.purple.color
                    break;
                default:
                    alert('Color not defined!')
            }
        },
        setDataChange(state, action) {
            const orders = state.dataChange
            const eix = orders.findIndex((value) => {
                return (value.orderId === action.payload.orderId &&
                    value.productid === action.payload.productid &&
                    value.characteristicid === action.payload.characteristicid)
            })

            if (eix > -1) {
                orders[eix] = action.payload
                state.dataChange = orders
            } else {
                state.dataChange = [...orders, action.payload]
            }
        },

        clearDataChangeItem(state, action) {
            const orders = state.dataChange
            const eix = orders.findIndex((value) => {
                return value.orderId === action.payload.orderId &&
                    value.productid === action.payload.productid &&
                    value.characteristicid === action.payload.characteristicid
            })
            if (eix > -1) {
                const removed = orders.splice(eix, 1)
                state.dataChange = orders
            }
        },

        clearDataChange(state) {
            state.dataChange = []
        },
        cleanState(state) {
            state.token = []
            state.steps = []
            state.digStorages = []
            state.stepOrders = []
            state.filterOrders = []
            state.currentStep = []
            state.groupOrders = []
            state.currentStorageId = ''
            state.searchText = ''
            state.dataChange = []
            state.notifications = []
            state.totalPlantQty = 0
            state.totalOrderQty = 0
            state.filterPlants = []
            state.filterPlantQty = null,
            state.filterOrderQty = null,
            state.btPermission = []
        },
    },
})

export const {
    setDigStorages, setStepOrders, setSteps, setToken,
    cleanState, setCurrentStep, setGroupOrders,
    setStorageId, setDataChange, clearDataChange,
    clearDataChangeItem, setNotifications, setTotalQty,
    setCurrentColorStep, setFilterOrders, setFilterPlants,
    setFilterQty, setSearchText, setBTPermission
} = dataSlice.actions

export default dataSlice.reducer