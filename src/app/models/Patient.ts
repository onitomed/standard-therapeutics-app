export interface Patient {
    id: string,
    name: string,
    dependent: boolean,
    root: boolean,
    users: [string],
    token: string

}