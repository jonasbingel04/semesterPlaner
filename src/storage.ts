import type { Modul } from './App.svelte';

export function saveToFile(modules: Modul[]) {
    const data = JSON.stringify(modules, null, 2);
    const blob = new Blob([data], {type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'studienplan.json';
    link.click();

    URL.revokeObjectURL(url);
}

export function loadFromFile(): Promise<Modul[]> {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    resolve(json);
                } catch (err) {
                    reject("Ungültige JSON Datei")
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });
}