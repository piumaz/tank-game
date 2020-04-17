
class Game {
    constructor() {
        this.data = {
            score : 0,
        };

        this.mp = {
            playername: 'anonymous',
            x: 0,
            y: 0,
            angle: 0,
            angleGun: 0,
            tankDegrees: 0,
            gunDegrees: 0,
            shoot: false,
            hit: false,
            score: this.data.score,
        }
    }
}

export default new Game();
