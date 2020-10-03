import { ErrorReportingProvider } from './../../providers/error-reporting/error-reporting';
import { App } from 'ionic-angular';
/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: page-process-metrics
Description: Renders process metrics tabs. Uses pre defined chart and socket call to retrieve chart data from server.
Location: ./pages/page-process-metrics
Author: Hassan
Version: 1.0.0
Modification history: none
*/

import { LoadingProvider } from './../../providers/loading/loading';
import { ProcessDataProvider } from './../../providers/process-data/process-data';
import { SocketProvider } from './../../providers/socket/socket';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { ApplicationTabsPage } from '../tabs-application/ApplicationTabs';

/**
 * Generated class for the ProcessMetricsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-process-metrics',
  templateUrl: 'process-metrics.html',
})
export class ProcessMetricsPage {
  @ViewChild(Content) content: Content;
  tempcount = 0
  currentProcessID: number;//process id of the selected process
  sliderValue: any=new Date().getFullYear();//year slider value to use while retreiving aggregate data
  processWorkflows: any[];//all workflows of the selected process
  selectedWorkFlow: any = 0;//workflow dropdown selected value
  currentYear;//stores current year value
  minYear;//minimum year to support
  taskBreakDownNotUpdating: boolean = true;//flag to indicate taskbreakdown updating or not. needed to refresh the task breakdown pie chart
  workflowTurnaroundNotUpdating: boolean = true;//flag to indicate workflow turnaround line chart updating or not. needed to refresh workflow turnaround line chart
  currentProcessMetricsData: any;// stores all process metrics aggregate data returned for the web service call
  pieChartSupported:boolean=true;// holds the flag that the pie chart is supported or not based of which, pie chart is renedered. Set according to number of tasks
  
  // workflow turnaround line chart data
  public lineChartData: any = [
    { data: [], label: '' },

  ];

  // monthly active users bar chart default color
  public colorsUsers: any = [{
    backgroundColor: '#1de9b6',
  }];

  //monthly trnasactions data default color
  public colorsTransactions: any = [{
    backgroundColor: '#071d49',
  }];

  //task breakdows pie chart slices default colors
  public colorsPieChart: any = [{
    backgroundColor: ['#424242', '#0288d1', '#1de9b6', '#84bd00', '#071d49', '#0d47a1', '#5d67f1', '#ac6f5a', '#79c756', '#ffcd00'],
  }];

  // workflow turnaround line chart default color
  public colorsBellCurve: any = [{
    backgroundColor: '#a1887f',
  }];

  //monthly transactios bar chart options requried by chart js bar chart to render
  public barChartOptionsTransactions: any = {
    scaleShowVerticalLines: false,
    responsive: true,//responsiveness toggle
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          stacked: true,//stack if mutiple datasets
          scaleLabel: {
            display: true,
            labelString: 'Months'//bottom label
          }
        },
      ],
      yAxes: [
        {
          stacked: true,//stack if mutiple datasets
          ticks: {
            beginAtZero: true,
            userCallback: function (label, index, labels) {
              // when the floored value is the same as the value we have a whole number
              if (Math.floor(label) === label) {
                return label;
              }

            },
          },
          scaleLabel: {
            display: true,
            labelString: 'No. of Transactions' //left label
          }
        }
      ]
    }
  };


  //monthly active users bar chart options requied by chart js bar chart to render
  public barChartOptionsUsers: any = {
    scaleShowVerticalLines: false,
    responsive: true,//responsiveness toggle
    legend: {
      display: false,//dont show legend
    },
    scales: {
      xAxes: [
        {
          stacked: true,//stack if mutiple datasets
          scaleLabel: {
            display: true,
            labelString: 'Months'//bottm label
          }
        },
      ],
      yAxes: [
        {
          stacked: true,//stack if mutiple datasets
          ticks: {
            beginAtZero: true,
            userCallback: function (label, index, labels) {
              // when the floored value is the same as the value we have a whole number
              if (Math.floor(label) === label) {
                return label;
              }

            },
          },
          scaleLabel: {
            display: true,
            labelString: 'No. of Users'//left label
          }
        }
      ]
    }
  };

  /**
  * resize the current ViewChild.
  */
  ngDoCheck() {
    this.content.resize();
  }

  //workflow turnaround line chart options required by chart js line chart to render
  public lineChartOptions: any = {
    responsive: true,//responsiveness toggle
    legend: {
      display: false,//dont show legent
    },
    scales: {
      yAxes: [{
        stacked: true,//stack if mutiple datasets
        ticks: {
          beginAtZero: true,
          userCallback: function (label, index, labels) {
            // when the floored value is the same as the value we have a whole number
            if (Math.floor(label) === label) {
              return label;
            }

          },
        },
        scaleLabel: {
          display: true,
          labelString: 'No. of Requests',

        }
      }],
      xAxes: [{
        stacked: true,//stack if mutiple datasets

        scaleLabel: {
          display: true,
          labelString: 'No. of Days'
        }
      }]
    },

  }

  public lineChartLegend: boolean = true;//show legend on workflow turnaround chart
  public lineChartType: string = 'line';//chart type string of workflow turnaround chart
  public pieChartLabels: string[] = [''];//pie chart slices labels
  public pieChartData: number[] = [];//pie chart data array
  public pieChartType: string = 'pie';//task breakdown chart type
  
  //task breakdown pie chart options required by chart js pie chart to render
  public pieChartOptions: any = {
    legend: {
      display: true,
      position: 'left',
      reverse: false
    },
    pieceLabel: {
      render: function (args) {
        return args.value + '(' + args.percentage + '%)';// string expression to display on pie slice
      },
      fontColor: ['white', 'white'],
      precision: 0
    },
    responsive:true,
    maintainAspectRatio:false
  }

  
  public lineChartLabels: Array<any> = [];//workflow turnaround labels to dispaly at the bottom
  public taskBreakDownHasData: boolean = false;// flag set unset based of taskbreakdown data so the chart can be hidden using this value
  public barChartDataTransactions: any = [{ data: [], label: "" }];// montly transactions bar chart data
  public barChartLabelsTransactions: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];//bottom labels for monthly transactions bar chart
  public barChartTypeTransactions: string = 'bar';//transactions chart type
  public barChartLegendTransactions: boolean = true;//show transactions chart legend
  public barChartDataUsers: any = [{ data: [], label: "" }];//users chart data default values
  public barChartLabelsUsers: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];//bottom labels of monthly active users chart
  public barChartTypeUsers: string = 'bar';//users chart type
  public barChartLegendUsers: boolean = true;//users chart legend
  public sortStringObject = { "DaysToComplete": 'asc' }// workflow turnaround defualt sort string


    /**
    * Default constructor with dependency injection of all necessary objects and services 
    */
  constructor(private errorReportingProvider: ErrorReportingProvider,public navCtrl: NavController, public navParams: NavParams, private loading: LoadingProvider, private socket: SocketProvider, private globalservice: ProcessDataProvider, private app: App) {
    this.sliderValue = new Date().getFullYear();
  }

    /**
    * Component initialization lifecycle hook which sets current year, min year for year slider, back navigation array calls performProcessMetricsLoadOperations
    */
  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.minYear = this.currentYear - 2;
    
    this.performProcessMetricsLoadOperations(1);
    //this.navArray = [{ urlBack: ['main', 'process', this.currentProcessID, 'home', 'tasks'], urlImage: '', imagesrc: 'assets\\images\\process_menu\\processmetrics-filled.png', text: 'Process Metrics' }]
  }

  
  /**
    * Navigate back function
    */
gotomyprocess() {
    this.globalservice.processId = 0;

    if(this.globalservice.processToast){
      this.globalservice.processToast.dismiss();
    }
    
    this.app.getRootNav().pop().catch((error) => {
      this.app.getRootNav().setRoot(ApplicationTabsPage, { tabIndex: 0 });
    });
  }

  
  /**
    * Operations to perform on page load including web service call to retrieve addons data
    */
    performProcessMetricsLoadOperations(maybe) {
    try{
      var self = this;
      var params = {
        authenticationToken: self.globalservice.user.AuthenticationToken,
        processID: self.globalservice.processId,
        workflowID: self.selectedWorkFlow.toString(),
        year: self.sliderValue.toString(),
        diagnosticLogging: this.globalservice.processDiagnosticLog.toString(),
        operationType : 'PROCESS'

      }
      if (maybe == 1 || self.tempcount > 0)
      {
        self.loading.presentLoading("Please wait...", 20000)
      }
      this.taskBreakDownHasData = false;
      self.socket.callWebSocketService('retrieveProcessMetricsData', params).then((response) => {
        try {
          self.currentProcessMetricsData = "";

          if (maybe == 1 || self.tempcount > 0) {
            self.loading.hideLoading();
          }

          if (maybe == 0) {
            self.tempcount = 10;
          }
          self.currentProcessMetricsData = response;
          if (self.currentProcessMetricsData.TaskBreakdown.length > 0) {
            self.taskBreakDownHasData = true;
          }
          self.processWorkflows = self.currentProcessMetricsData.ProcessWorkflows;
          if (parseInt(self.selectedWorkFlow) == 0) {
            self.selectedWorkFlow = self.processWorkflows[0]["WorkflowID"];
          }
          self.generateChartsBySelectedYearAndWorkflow();
        }
        catch (e) {
          alert('Error while processing')
        }
      }).catch(error => {
        self.loading.hideLoading();
        if (error != 'NoConnection') {
          this.errorReportingProvider.logErrorOnAppServer('Process Metrics Error',
          'An error occured while loading data',
          this.globalservice.user["AuthenticationToken"],
          this.globalservice.processId,
          'performProcessMetricsLoadOperations',
          error.message ? error.message : '',
          error.stack ? error.stack : '',
        new Date().toTimeString(),
        'open',
        'Platform',
        '');
        }
      });
    }
    catch (error) {
      this.errorReportingProvider.logErrorOnAppServer('Process Metrics Error',
        'An error occured while loading data',
        this.globalservice.user["AuthenticationToken"],
        this.globalservice.processId,
        'performProcessMetricsLoadOperations',
        error.message ? error.message : '',
        error.stack ? error.stack : '',
      new Date().toTimeString(),
      'open',
      'Platform',
      '');
    }
  }

  
  /**
    * Checks if string is valid json
    */
  public isJSON(str) {
    try {
      return (JSON.parse(str) && !!str);
    } catch (e) {
      return false;
    }
  }

  
  /**
    * Default constructor with dependency injection of all necessary objects and services 
  */
  public generateChartsBySelectedYearAndWorkflow() {
    try{
      this.generateMonthlyTransactionsBarChart()
      this.generateMonthlyActiveUsersBarChart();
      this.generateAvgTaskCompletionDaysPieChart();
      this.generateWorkflowTurnaroundLineChart();
    }
    catch(error){
      //this.rapidflowService.ShowErrorMessage("getDataByYear process metrics component", "Platform", "Error occured while getting data by year", error, error.stack, "N/A", this.currentProcessID, true);
      this.errorReportingProvider.logErrorOnAppServer('Process Metrics Error',
      'Error occured while getting data by year',
      this.globalservice.user["AuthenticationToken"],
      this.globalservice.processId,
      'generateChartsBySelectedYearAndWorkflow',
      error.message ? error.message : '',
      error.stack ? error.stack : '',
      new Date().toTimeString(),
      'open',
      'Platform',
      '');
    }
  }


    /**
    * Processes retrieved monthly transactions data and processes it to render montly transactions bar chart  
    */

  generateMonthlyTransactionsBarChart(){
    this.currentProcessMetricsData;
    let currentWorkflowDisplayName;
    let monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; this.currentProcessMetricsData.ProcessWorkflows; i++) {
      if (this.selectedWorkFlow == this.currentProcessMetricsData.ProcessWorkflows[i].WorkflowID) {
        currentWorkflowDisplayName = this.currentProcessMetricsData.ProcessWorkflows[i].WorkflowDisplayName;
        break;
      }
    }
    if (this.currentProcessMetricsData.monthlyTransactions.length > 0) {
      for (let i = 0; i < this.currentProcessMetricsData.monthlyTransactions.length; i++) {
        monthlyData[this.currentProcessMetricsData.monthlyTransactions[i].Month - 1] = this.currentProcessMetricsData.monthlyTransactions[i].Tranactions;
       
      }
      this.barChartDataTransactions = [{
        data:monthlyData,
        label: currentWorkflowDisplayName
      }];
      
      
    } else {
      this.barChartDataTransactions = [{ data: [], label: "" }];
    }
  }

     /**
    * Processes retrieved monthly users data and processes it to render montly users bar chart  
    */
  generateMonthlyActiveUsersBarChart(){


   
    let monthUsers=this.groupUniqueMonthlyUsers(this.currentProcessMetricsData.monthlyActiveUsers);
    let currentWorkflowDisplayName;
    
    for (let i = 0; this.currentProcessMetricsData.ProcessWorkflows; i++) {
      if (this.selectedWorkFlow == this.currentProcessMetricsData.ProcessWorkflows[i].WorkflowID) {
        currentWorkflowDisplayName = this.currentProcessMetricsData.ProcessWorkflows[i].WorkflowDisplayName;
        break;
      }
    }



    this.barChartDataUsers = [{
      data:monthUsers,
      label: currentWorkflowDisplayName
    }];
  }

   /**
    * Processes retrieved workflow turnaround data and processes it to render workflow turnaround line chart
    */
generateWorkflowTurnaroundLineChart(){
  this.currentProcessMetricsData.WorkflowTurnAround.sort(function (a, b) { return a.DaysToComplete - b.DaysToComplete });
  let workflowTurnAroundLabels = [];
  let workflowTurnAroundData = [];
 

  if (this.currentProcessMetricsData.WorkflowTurnAround.length > 0) {
    for (let i = 0; i < this.currentProcessMetricsData.WorkflowTurnAround.length; i++) {
      if(this.currentProcessMetricsData.WorkflowTurnAround[i]["DaysToComplete"]>0)
      {
        if(this.currentProcessMetricsData.WorkflowTurnAround[i]["DaysToComplete"]>0)
        {
          workflowTurnAroundLabels.push(this.currentProcessMetricsData.WorkflowTurnAround[i]["DaysToComplete"].toString());
          workflowTurnAroundData.push(this.currentProcessMetricsData.WorkflowTurnAround[i]["NumberOfRequests"]);
        }
        
        
      }
      this.workflowTurnaroundNotUpdating = false;
      setTimeout(() => {
        this.lineChartData=[];
        this.lineChartData[0]={};
        this.lineChartData[0].data=workflowTurnAroundData;
        this.lineChartLabels=workflowTurnAroundLabels;
        this.workflowTurnaroundNotUpdating = true;
      }, 1)
    }
    
  } else {
    this.lineChartData = [{ data: [], label: "" }];
  }
}

generateAvgTaskCompletionDaysPieChart(){
  let tempPieChartDataAndLabels:any=this.getAvgTaskComplettionDays(this.currentProcessMetricsData.TaskBreakdown)
  if(tempPieChartDataAndLabels.labels.length<=10)
  {
    this.pieChartSupported=true;
  }
  else{
    this.pieChartSupported=false;
  }

  this.taskBreakDownNotUpdating = false;
  setTimeout(() => {
    this.pieChartLabels = tempPieChartDataAndLabels.labels;
    this.pieChartData = tempPieChartDataAndLabels.data;
    this.taskBreakDownNotUpdating = true;
  }, 1); 

}


  groupUniqueMonthlyUsers(yearActiveUsers){
    let monthlyTotalUsers=[
      [],[],[],[],[],[],[],[],[],[],[],[]
    ];
    for(let i=0;i<yearActiveUsers.length;i++)
    {
    
      for(let j=0;j<yearActiveUsers[i].U.length;j++)
      {
        monthlyTotalUsers[yearActiveUsers[i].M-1].push(yearActiveUsers[i].U[j].E.toLowerCase());
      }
      

    }
    let monthlyUniqueUsers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let i=0;i<monthlyTotalUsers.length;i++)
    {
      let tempUsersArray=[];
      for(let j=0;j<monthlyTotalUsers[i].length;j++)
      {
          if(tempUsersArray.indexOf(monthlyTotalUsers[i][j])==-1)
          {
            tempUsersArray.push(monthlyTotalUsers[i][j]);
          }
      }
      monthlyUniqueUsers[i]=tempUsersArray.length;
    }

    return monthlyUniqueUsers;


    

  }


  getAvgTaskComplettionDays(taskCompletionDaysArray){
   
    let taskNamesArray=[];
    let totalCompletionDaysArray=[];
    let taskCountsArray=[];
     for(let i=1;i<taskCompletionDaysArray.length;i++)
    {
      for(let j=1;j<taskCompletionDaysArray[i].D.length;j++)
      {
        if(taskCompletionDaysArray[i].D[j].N<=365&&taskCompletionDaysArray[i].D[j].N>=0)
        {
        if(taskNamesArray.indexOf(taskCompletionDaysArray[i].D[j].T)==-1)
        {
          
         
            taskNamesArray.push(taskCompletionDaysArray[i].D[j].T);
            totalCompletionDaysArray[taskNamesArray.length-1]=taskCompletionDaysArray[i].D[j].N+1;
            taskCountsArray[taskNamesArray.length-1]=1;
         
         
        }
        else{
          totalCompletionDaysArray[taskNamesArray.indexOf(taskCompletionDaysArray[i].D[j].T)+1]+=taskCompletionDaysArray[i].D[j].N+1;
          taskCountsArray[taskNamesArray.indexOf(taskCompletionDaysArray[i].D[j].T)+1]++;
        }
      }
      }
    }
    for(let i=0;i<totalCompletionDaysArray.length;i++)
    {
      totalCompletionDaysArray[i]=Math.ceil(totalCompletionDaysArray[i]/taskCountsArray[i]);
    }
    let pieChartObject={
      data:totalCompletionDaysArray,
      labels:taskNamesArray.sort(function(a,b)
      {
        if(a < b) return -1;
        if(a>b) return 1;
        return 0;
      })
    };
    return pieChartObject;
  }
}
