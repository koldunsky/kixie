const stateController =

module.exports = () => {
  state = {
    magnifier: null,
  };

  openMagnifier = () => {
    this.state.magnifier = 1;
    console.info(this.state.magnifier);
  };

  closeMagnifier = () => {
    this.state.magnifier = null;
    console.info(this.state.magnifier);
  };

  return this;
};

module.exports = stateController();