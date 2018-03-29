Vue.component('demo-grid', {
	template: '#grid-template',
	props: {
		data: Array,
		columns: Array,
		filterKey: String
	},
	data: function () {
		var sortOrders = {}
		this.columns.forEach(function (key) {
			sortOrders[key] = 1
		})
		return {
			sortKey: '',
			sortOrders: sortOrders
		}
	},
	computed: {
		filteredData: function () {
			var sortKey = this.sortKey
			var filterKey = this.filterKey && this.filterKey.toLowerCase()
			var order = this.sortOrders[sortKey] || 1
			var data = this.data
			if (filterKey) 
			{
				data = data.filter(function (row) {
					return Object.keys(row).some(function (key) {
						return String(row[key]).toLowerCase().indexOf(filterKey) > -1
					})
				})
			}
			if (sortKey) 
			{
				data = data.slice().sort(function (a, b) {
					a = a[sortKey]
					b = b[sortKey]
					return (a === b ? 0 : a > b ? 1 : -1) * order
				})
			}
			return data
		}
	},
	methods: {
		deletarIndicador(id, i){
			fetch("http://slim/indicador/delete/"+id, {method: "DELETE"})
			.then(() => {
				tabelaApp.gridData.splice(i, 1);
			})
		},
		editarIndicador(indicador){
			formulario.indicador = JSON.parse(JSON.stringify(indicador));
		}
	}
})

var formulario = new Vue({
	el: '#formulario',
	data: {
		campos: [
		  'id', 'dataIntegracao', 'dataUltAlteracao', 'formulaCalculo', 'idDrgIntegracao', 'identDirecaoSeta', 'identPeriodicidade', 'identReferencial', 'informacoesAdicionais', 'nome', 'numDecimais', 'objetivo', 'unidade', 'usuarioUltAlteracao', 'versao'
		],
		indicador: {}
	},
	methods: {
		sendForm: function(e){
			e.preventDefault();
			var dados = JSON.stringify(this.indicador);
			console.log(dados);
			fetch("http://slim/indicador/save", {
				body: dados,
				method: "POST", 
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then(() => {
				var indicador = JSON.parse(dados);
				for(var i in tabelaApp.gridData)
				{
					if(tabelaApp.gridData[i].id == indicador.id)
					{
						Vue.set(tabelaApp.gridData, i, indicador);
						return;
					}
				}
				tabelaApp.gridData.push(indicador);
			});
		}
	}
})

var tabelaApp = new Vue({
	el: '#tabela',
	data: {
		searchQuery: '',
		gridColumns: formulario.campos,
		gridData: []
	},
	mounted(){
		fetch("http://slim/indicador/all")
		.then(response => response.json())
		.then((data) => {
			this.gridData = data.sort(function(a, b) {
				return a.id - b.id;
			});
		})
	}
});