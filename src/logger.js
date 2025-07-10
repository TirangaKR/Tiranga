module.exports = function getLogger(prefix) {
    const _console = {};
    for (const k of Object.entries(console)) {
        _console[k[0]] = (...args) => {
            if (args.length > 0) {
                args[0] = prefix + " > " + args[0];
            } else {
                args = [prefix + " > "];
            }
            return k[1](...args);
        }
    }
    return _console;
}