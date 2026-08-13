import Html from "./html";
import RateLimiter from './rate_limiter';

class Scroll {

    constructor(protected html: Html, protected rateLimiter: RateLimiter) { }

    init(): void {
        let posY = 0;

        const onScroll = this.rateLimiter.throttle(() => {
            const currentY = window.pageYOffset || document.documentElement.scrollTop;

            if (posY) {
                currentY > 80 ?
                    this.setBodyClass(currentY - posY) :
                    this.setBodyClass(-1);
            }

            this.setArrowUpClass(currentY);

            posY = currentY;
        }, 100);

        document.addEventListener('scroll', onScroll);
    }

    // For showing or hiding submenu
    protected setBodyClass(direction: number): void {
        if (direction > 0) {
            if (!this.html.hasClass('body', 'scroll-down')) {
                this.html.removeClass('body', 'scroll-up');
                this.html.addClass('body', 'scroll-down');
            }
        } else {
            if (!this.html.hasClass('body', 'scroll-up')) {
                this.html.removeClass('body', 'scroll-down');
                this.html.addClass('body', 'scroll-up');
            }
        }
    }

    // To show or hide small "ArrowUp" icon that scrolls you to the top
    protected setArrowUpClass(currentY: number): void {
        if (currentY > 100) {
            const arrowUp = this.html.q('.arrow-up');
            if (arrowUp && !this.html.hasClass(arrowUp, 'arrow-up--active')) {
                this.html.addClass(arrowUp, 'arrow-up--active');
            }
        } else {
            const arrowUp = this.html.q('.arrow-up--active');
            if (arrowUp) {
                this.html.removeClass(arrowUp, 'arrow-up--active');
            }
        }
    }
}

export default Scroll;